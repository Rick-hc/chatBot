// 🚀 ULTIMATE WebRTC Service - 完璧なリアルタイム通信
class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isInitiator: boolean = false;
  private onDataChannelMessage?: (message: any) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onConnectionStateChange?: (state: RTCPeerConnectionState) => void;

  // ICE サーバー設定（STUN/TURN）
  private readonly iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  constructor() {
    this.checkWebRTCSupport();
  }

  // 🔍 WebRTC サポート確認
  private checkWebRTCSupport(): boolean {
    const isSupported = !!(
      window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection
    );

    if (!isSupported) {
      console.error('❌ WebRTC is not supported in this browser');
      return false;
    }

    console.log('✅ WebRTC is supported');
    return true;
  }

  // 🎯 完璧な初期化
  async initialize(config?: {
    onDataChannelMessage?: (message: any) => void;
    onRemoteStream?: (stream: MediaStream) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  }): Promise<void> {
    try {
      // コールバック設定
      if (config) {
        this.onDataChannelMessage = config.onDataChannelMessage;
        this.onRemoteStream = config.onRemoteStream;
        this.onConnectionStateChange = config.onConnectionStateChange;
      }

      // PeerConnection作成
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
        iceCandidatePoolSize: 10
      });

      // イベントリスナー設定
      this.setupEventListeners();

      console.log('✅ WebRTC initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  // 🎧 イベントリスナーの完璧な設定
  private setupEventListeners(): void {
    if (!this.peerConnection) return;

    // ICE候補の処理
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 New ICE candidate:', event.candidate);
        // シグナリングサーバーに送信（実装依存）
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // データチャネル受信
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannel(channel);
      console.log('📡 Data channel received:', channel.label);
    };

    // リモートストリーム受信
    this.peerConnection.ontrack = (event) => {
      console.log('📹 Remote stream received');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // 接続状態変更
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('🔗 Connection state changed:', state);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
    };

    // ICE接続状態変更
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection!.iceConnectionState);
    };
  }

  // 📡 データチャネルの完璧な設定
  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('✅ Data channel opened:', channel.label);
    };

    channel.onclose = () => {
      console.log('❌ Data channel closed:', channel.label);
    };

    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Data channel message received:', message);
        if (this.onDataChannelMessage) {
          this.onDataChannelMessage(message);
        }
      } catch (error) {
        console.error('❌ Failed to parse data channel message:', error);
      }
    };

    channel.onerror = (error) => {
      console.error('❌ Data channel error:', error);
    };
  }

  // 🚀 通話の開始（発信者）
  async startCall(constraints?: MediaStreamConstraints): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('WebRTC not initialized');
    }

    try {
      this.isInitiator = true;

      // メディアストリーム取得（必要な場合）
      if (constraints) {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
        console.log('🎥 Local media stream added');
      }

      // データチャネル作成
      this.dataChannel = this.peerConnection.createDataChannel('chat', {
        ordered: true
      });
      this.setupDataChannel(this.dataChannel);

      // オファー作成
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('✅ Offer created and set as local description');

      return offer;
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }

  // 📞 通話の応答（受信者）
  async answerCall(
    offer: RTCSessionDescriptionInit,
    constraints?: MediaStreamConstraints
  ): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('WebRTC not initialized');
    }

    try {
      this.isInitiator = false;

      // メディアストリーム取得（必要な場合）
      if (constraints) {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
        console.log('🎥 Local media stream added');
      }

      // リモート記述設定
      await this.peerConnection.setRemoteDescription(offer);
      console.log('✅ Remote offer set');

      // アンサー作成
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('✅ Answer created and set as local description');

      return answer;
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw error;
    }
  }

  // 📝 アンサーの処理（発信者）
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('WebRTC not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('✅ Remote answer set');
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
      throw error;
    }
  }

  // 🧊 ICE候補の追加
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('WebRTC not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
      throw error;
    }
  }

  // 💬 データ送信
  sendData(data: any): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('❌ Data channel not ready');
      return false;
    }

    try {
      const message = JSON.stringify({
        type: 'chat-message',
        data: data,
        timestamp: Date.now()
      });
      
      this.dataChannel.send(message);
      console.log('📤 Data sent:', data);
      return true;
    } catch (error) {
      console.error('❌ Failed to send data:', error);
      return false;
    }
  }

  // 🎥 画面共有の開始
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // 既存のビデオトラックを置換
      if (this.peerConnection && this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender) {
          await sender.replaceTrack(videoTrack);
          console.log('✅ Screen share started');
        }
      }

      return screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      throw error;
    }
  }

  // ⏹️ 画面共有の停止
  async stopScreenShare(): Promise<void> {
    try {
      if (this.localStream && this.peerConnection) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
          console.log('✅ Screen share stopped');
        }
      }
    } catch (error) {
      console.error('❌ Failed to stop screen share:', error);
      throw error;
    }
  }

  // 📊 統計情報の取得
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) {
      return null;
    }

    try {
      const stats = await this.peerConnection.getStats();
      console.log('📊 WebRTC stats retrieved');
      return stats;
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return null;
    }
  }

  // 🎤 音声の有効/無効切り替え
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log(`🎤 Audio ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  // 📹 ビデオの有効/無効切り替え
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  // 🔗 接続状態の取得
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  // 📡 データチャネル状態の取得
  getDataChannelState(): RTCDataChannelState | null {
    return this.dataChannel?.readyState || null;
  }

  // 🧹 完璧なクリーンアップ
  async cleanup(): Promise<void> {
    try {
      // データチャネルのクローズ
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // ローカルストリームの停止
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // リモートストリームのクリア
      this.remoteStream = null;

      // PeerConnectionのクローズ
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      console.log('✅ WebRTC cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup WebRTC:', error);
    }
  }

  // 📡 シグナリングメッセージ送信（実装依存）
  private sendSignalingMessage(message: any): void {
    // 実際の実装ではWebSocketやHTTPを使用してシグナリングサーバーに送信
    console.log('📡 Signaling message to send:', message);
    
    // WebSocketの例（実装時に有効化）
    // if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
    //   this.signalingSocket.send(JSON.stringify(message));
    // }
  }

  // 🎯 メディアデバイスの取得
  static async getMediaDevices(): Promise<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        videoInputs: devices.filter(device => device.kind === 'videoinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('❌ Failed to get media devices:', error);
      return {
        audioInputs: [],
        videoInputs: [],
        audioOutputs: []
      };
    }
  }

  // 🔍 ブラウザ機能確認
  static checkBrowserCapabilities(): {
    webRTC: boolean;
    dataChannels: boolean;
    screenShare: boolean;
    mediaDevices: boolean;
  } {
    return {
      webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      dataChannels: !!window.RTCDataChannel,
      screenShare: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    };
  }
}

// シングルトンインスタンス
export const webRTCService = new WebRTCService();

export default WebRTCService;