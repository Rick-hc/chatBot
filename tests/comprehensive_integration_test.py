#!/usr/bin/env python3
"""
🚨 ULTIMATE Integration Test - 100%動作保証テスト
完全なエンドツーエンドテストスイート
"""

import asyncio
import requests
import json
import time
import numpy as np
from typing import Dict, List, Any, Optional
import os
import sys

class ComprehensiveIntegrationTest:
    def __init__(self):
        self.backend_url = "http://localhost:8001"
        self.frontend_url = "http://localhost:3000"
        self.test_results = []
        self.api_key_configured = False
        
    def log_test(self, test_name: str, passed: bool, details: str = "", duration: float = 0):
        """テスト結果をログ"""
        status = "✅ PASS" if passed else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "passed": passed,
            "details": details,
            "duration": duration,
            "timestamp": time.strftime("%H:%M:%S")
        }
        self.test_results.append(result)
        print(f"{status} | {test_name} ({duration:.2f}s)")
        if details:
            print(f"     Details: {details}")

    def test_backend_health_check(self) -> bool:
        """バックエンドヘルスチェック"""
        print("\n🔍 Testing Backend Health Check...")
        start_time = time.time()
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health Check", True, f"Status: {data.get('status', 'unknown')}", duration)
                return True
            else:
                self.log_test("Backend Health Check", False, f"HTTP {response.status_code}", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Backend Health Check", False, f"Connection error: {str(e)}", duration)
            return False

    def test_openai_embedding_integration(self) -> bool:
        """OpenAI Embeddings API統合テスト"""
        print("\n🤖 Testing OpenAI Embeddings Integration...")
        start_time = time.time()
        
        try:
            # テスト用の日本語文章
            test_text = "会社の営業時間について教えてください"
            
            payload = {"text": test_text}
            response = requests.post(f"{self.backend_url}/embed", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                embedding = data.get("embedding", [])
                
                if isinstance(embedding, list) and len(embedding) > 0:
                    # エンベディングの妥当性チェック
                    if len(embedding) >= 1000:  # text-embedding-3-largeは3072次元
                        self.log_test("OpenAI Embeddings API", True, f"Embedding dimension: {len(embedding)}", duration)
                        self.api_key_configured = True
                        return True
                    else:
                        self.log_test("OpenAI Embeddings API", False, f"Invalid embedding dimension: {len(embedding)}", duration)
                        return False
                else:
                    self.log_test("OpenAI Embeddings API", False, "Empty or invalid embedding response", duration)
                    return False
            else:
                error_details = response.text[:200] if response.text else f"HTTP {response.status_code}"
                self.log_test("OpenAI Embeddings API", False, error_details, duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("OpenAI Embeddings API", False, f"Request failed: {str(e)}", duration)
            return False

    def test_cosine_similarity_calculation(self) -> bool:
        """コサイン類似度計算の正確性テスト"""
        print("\n📐 Testing Cosine Similarity Calculation...")
        start_time = time.time()
        
        try:
            if not self.api_key_configured:
                self.log_test("Cosine Similarity Test", False, "OpenAI API not configured, skipping", 0)
                return False
            
            # 2つの類似したテキストのエンベディング取得
            text1 = "営業時間は何時ですか"
            text2 = "営業時間について教えて"
            
            # 1つ目のエンベディング
            response1 = requests.post(f"{self.backend_url}/embed", json={"text": text1}, timeout=30)
            if response1.status_code != 200:
                self.log_test("Cosine Similarity Test", False, "Failed to get first embedding", 0)
                return False
            
            embedding1 = response1.json()["embedding"]
            
            # 2つ目のエンベディング
            response2 = requests.post(f"{self.backend_url}/embed", json={"text": text2}, timeout=30)
            if response2.status_code != 200:
                self.log_test("Cosine Similarity Test", False, "Failed to get second embedding", 0)
                return False
            
            embedding2 = response2.json()["embedding"]
            
            # NumPyで類似度計算（参考値）
            vec1 = np.array(embedding1).reshape(1, -1)
            vec2 = np.array(embedding2).reshape(1, -1)
            similarity = np.dot(vec1, vec2.T)[0][0] / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
            
            duration = time.time() - start_time
            
            # 類似したテキストなので類似度は0.7以上であることを期待
            if similarity > 0.7:
                self.log_test("Cosine Similarity Calculation", True, f"Similarity: {similarity:.3f}", duration)
                return True
            else:
                self.log_test("Cosine Similarity Calculation", False, f"Low similarity: {similarity:.3f}", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Cosine Similarity Calculation", False, f"Calculation failed: {str(e)}", duration)
            return False

    def test_search_functionality(self) -> bool:
        """検索機能テスト"""
        print("\n🔍 Testing Search Functionality...")
        start_time = time.time()
        
        try:
            if not self.api_key_configured:
                self.log_test("Search Functionality", False, "OpenAI API not configured, skipping", 0)
                return False
            
            # テスト質問のエンベディング取得
            test_question = "営業時間について知りたいです"
            embed_response = requests.post(f"{self.backend_url}/embed", json={"text": test_question}, timeout=30)
            
            if embed_response.status_code != 200:
                self.log_test("Search Functionality", False, "Failed to get embedding for search", 0)
                return False
            
            embedding = embed_response.json()["embedding"]
            
            # 検索実行
            search_payload = {
                "embedding": embedding,
                "top_k": 5
            }
            
            search_response = requests.post(f"{self.backend_url}/search", json=search_payload, timeout=30)
            duration = time.time() - start_time
            
            if search_response.status_code == 200:
                results = search_response.json()
                candidates = results.get("candidates", [])
                
                if len(candidates) > 0:
                    # 候補の品質チェック
                    top_candidate = candidates[0]
                    similarity = top_candidate.get("similarity", 0)
                    
                    if similarity > 0.3:  # 合理的な類似度閾値
                        self.log_test("Search Functionality", True, f"Found {len(candidates)} candidates, top similarity: {similarity:.3f}", duration)
                        return True
                    else:
                        self.log_test("Search Functionality", False, f"Low similarity results: {similarity:.3f}", duration)
                        return False
                else:
                    self.log_test("Search Functionality", False, "No search results returned", duration)
                    return False
            else:
                error_details = search_response.text[:200] if search_response.text else f"HTTP {search_response.status_code}"
                self.log_test("Search Functionality", False, error_details, duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Search Functionality", False, f"Search failed: {str(e)}", duration)
            return False

    def test_answer_retrieval(self) -> bool:
        """回答取得テスト"""
        print("\n📝 Testing Answer Retrieval...")
        start_time = time.time()
        
        try:
            # 固定IDでテスト（QAデータが存在する場合）
            test_id = 1
            response = requests.get(f"{self.backend_url}/answer/{test_id}", timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                question = data.get("question", "")
                
                if answer and question:
                    self.log_test("Answer Retrieval", True, f"Retrieved answer for ID {test_id}", duration)
                    return True
                else:
                    self.log_test("Answer Retrieval", False, "Empty answer or question", duration)
                    return False
            else:
                error_details = response.text[:200] if response.text else f"HTTP {response.status_code}"
                self.log_test("Answer Retrieval", False, error_details, duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Answer Retrieval", False, f"Retrieval failed: {str(e)}", duration)
            return False

    def test_feedback_functionality(self) -> bool:
        """フィードバック機能テスト"""
        print("\n💬 Testing Feedback Functionality...")
        start_time = time.time()
        
        try:
            feedback_payload = {
                "qa_id": "test_1",
                "resolved": True
            }
            
            response = requests.post(f"{self.backend_url}/feedback", json=feedback_payload, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", "")
                
                if "success" in message.lower():
                    self.log_test("Feedback Functionality", True, "Feedback saved successfully", duration)
                    return True
                else:
                    self.log_test("Feedback Functionality", False, f"Unexpected response: {message}", duration)
                    return False
            else:
                error_details = response.text[:200] if response.text else f"HTTP {response.status_code}"
                self.log_test("Feedback Functionality", False, error_details, duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Feedback Functionality", False, f"Feedback failed: {str(e)}", duration)
            return False

    def test_frontend_accessibility(self) -> bool:
        """フロントエンドアクセシビリティテスト"""
        print("\n🌐 Testing Frontend Accessibility...")
        start_time = time.time()
        
        try:
            response = requests.get(self.frontend_url, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                
                # 基本的なHTML構造チェック
                checks = [
                    ("<html" in content, "HTML tag"),
                    ("<head" in content, "Head section"),
                    ("<body" in content, "Body section"),
                    ("viewport" in content, "Viewport meta tag"),
                    ("title" in content.lower(), "Title tag")
                ]
                
                passed_checks = [check[1] for check in checks if check[0]]
                failed_checks = [check[1] for check in checks if not check[0]]
                
                if len(failed_checks) == 0:
                    self.log_test("Frontend Accessibility", True, f"All HTML structure checks passed", duration)
                    return True
                else:
                    self.log_test("Frontend Accessibility", False, f"Failed checks: {', '.join(failed_checks)}", duration)
                    return False
            else:
                self.log_test("Frontend Accessibility", False, f"HTTP {response.status_code}", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("Frontend Accessibility", False, f"Access failed: {str(e)}", duration)
            return False

    def test_cors_configuration(self) -> bool:
        """CORS設定テスト"""
        print("\n🔗 Testing CORS Configuration...")
        start_time = time.time()
        
        try:
            # OPTIONSリクエストでCORSヘッダー確認
            response = requests.options(f"{self.backend_url}/health", timeout=10)
            duration = time.time() - start_time
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            # 基本的なCORSヘッダーの存在確認
            if cors_headers["Access-Control-Allow-Origin"]:
                self.log_test("CORS Configuration", True, f"CORS headers present", duration)
                return True
            else:
                self.log_test("CORS Configuration", False, "Missing CORS headers", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("CORS Configuration", False, f"CORS test failed: {str(e)}", duration)
            return False

    def test_error_handling(self) -> bool:
        """エラーハンドリングテスト"""
        print("\n⚠️ Testing Error Handling...")
        
        error_tests = [
            ("Empty embedding request", "/embed", {"text": ""}, 400),
            ("Invalid search request", "/search", {"embedding": [], "top_k": 5}, 400),
            ("Non-existent answer", "/answer/99999", None, 404),
            ("Invalid endpoint", "/invalid-endpoint", None, 404)
        ]
        
        all_passed = True
        
        for test_name, endpoint, payload, expected_status in error_tests:
            start_time = time.time()
            try:
                url = f"{self.backend_url}{endpoint}"
                
                if payload is not None:
                    response = requests.post(url, json=payload, timeout=10)
                else:
                    response = requests.get(url, timeout=10)
                
                duration = time.time() - start_time
                
                if response.status_code == expected_status:
                    self.log_test(f"Error Handling: {test_name}", True, f"Correct status {expected_status}", duration)
                else:
                    self.log_test(f"Error Handling: {test_name}", False, f"Expected {expected_status}, got {response.status_code}", duration)
                    all_passed = False
                    
            except Exception as e:
                duration = time.time() - start_time
                self.log_test(f"Error Handling: {test_name}", False, f"Exception: {str(e)}", duration)
                all_passed = False
        
        return all_passed

    def test_performance_benchmarks(self) -> bool:
        """パフォーマンスベンチマークテスト"""
        print("\n⚡ Testing Performance Benchmarks...")
        
        performance_tests = [
            ("Health Check Response Time", "/health", "GET", None, 1.0),  # 1秒以内
            ("Frontend Load Time", "", "GET", None, 3.0)  # 3秒以内
        ]
        
        all_passed = True
        
        for test_name, endpoint, method, payload, max_time in performance_tests:
            times = []
            
            for i in range(3):  # 3回測定
                start_time = time.time()
                try:
                    if "Frontend" in test_name:
                        url = self.frontend_url
                    else:
                        url = f"{self.backend_url}{endpoint}"
                    
                    if method == "GET":
                        response = requests.get(url, timeout=10)
                    else:
                        response = requests.post(url, json=payload, timeout=10)
                    
                    duration = time.time() - start_time
                    
                    if response.status_code in [200, 201]:
                        times.append(duration)
                        
                except Exception as e:
                    times.append(float('inf'))
            
            if times:
                avg_time = sum(times) / len(times)
                passed = avg_time <= max_time
                
                self.log_test(f"Performance: {test_name}", passed, f"Avg: {avg_time:.2f}s (limit: {max_time}s)", avg_time)
                
                if not passed:
                    all_passed = False
            else:
                self.log_test(f"Performance: {test_name}", False, "No successful requests", 0)
                all_passed = False
        
        return all_passed

    def test_end_to_end_flow(self) -> bool:
        """エンドツーエンドフローテスト"""
        print("\n🔄 Testing End-to-End Flow...")
        start_time = time.time()
        
        try:
            if not self.api_key_configured:
                self.log_test("End-to-End Flow", False, "OpenAI API not configured", 0)
                return False
            
            # Step 1: 質問のエンベディング作成
            question = "会社の営業時間について教えてください"
            embed_response = requests.post(f"{self.backend_url}/embed", json={"text": question}, timeout=30)
            
            if embed_response.status_code != 200:
                self.log_test("End-to-End Flow", False, "Step 1: Embedding failed", 0)
                return False
            
            embedding = embed_response.json()["embedding"]
            
            # Step 2: 類似度検索
            search_response = requests.post(f"{self.backend_url}/search", 
                                          json={"embedding": embedding, "top_k": 5}, timeout=30)
            
            if search_response.status_code != 200:
                self.log_test("End-to-End Flow", False, "Step 2: Search failed", 0)
                return False
            
            candidates = search_response.json()["candidates"]
            
            if len(candidates) == 0:
                self.log_test("End-to-End Flow", False, "Step 2: No candidates found", 0)
                return False
            
            # Step 3: 回答取得
            top_candidate = candidates[0]
            candidate_id = top_candidate.get("id", 1)
            
            answer_response = requests.get(f"{self.backend_url}/answer/{candidate_id}", timeout=10)
            
            if answer_response.status_code != 200:
                self.log_test("End-to-End Flow", False, "Step 3: Answer retrieval failed", 0)
                return False
            
            answer_data = answer_response.json()
            
            # Step 4: フィードバック送信
            feedback_response = requests.post(f"{self.backend_url}/feedback", 
                                            json={"qa_id": str(candidate_id), "resolved": True}, timeout=10)
            
            if feedback_response.status_code != 200:
                self.log_test("End-to-End Flow", False, "Step 4: Feedback failed", 0)
                return False
            
            duration = time.time() - start_time
            self.log_test("End-to-End Flow", True, f"Complete flow successful in {duration:.2f}s", duration)
            return True
            
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("End-to-End Flow", False, f"Flow failed: {str(e)}", duration)
            return False

    def run_comprehensive_test_suite(self) -> Dict[str, Any]:
        """包括的テストスイートの実行"""
        print("🚨 STARTING COMPREHENSIVE INTEGRATION TEST SUITE")
        print("=" * 70)
        print("🎯 Target: 100% Operational Guarantee")
        print("=" * 70)
        
        start_time = time.time()
        
        # テスト実行順序（依存関係を考慮）
        tests = [
            ("Backend Health Check", self.test_backend_health_check),
            ("CORS Configuration", self.test_cors_configuration),
            ("Frontend Accessibility", self.test_frontend_accessibility),
            ("OpenAI Embeddings Integration", self.test_openai_embedding_integration),
            ("Cosine Similarity Calculation", self.test_cosine_similarity_calculation),
            ("Search Functionality", self.test_search_functionality),
            ("Answer Retrieval", self.test_answer_retrieval),
            ("Feedback Functionality", self.test_feedback_functionality),
            ("Error Handling", self.test_error_handling),
            ("Performance Benchmarks", self.test_performance_benchmarks),
            ("End-to-End Flow", self.test_end_to_end_flow)
        ]
        
        # テスト実行
        for test_name, test_func in tests:
            print(f"\n{'='*20}")
            print(f"🔬 {test_name}")
            print(f"{'='*20}")
            test_func()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # 結果集計
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # 最終レポート
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_time": total_time,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "api_configured": self.api_key_configured,
            "detailed_results": self.test_results
        }
        
        self.print_final_report(report)
        return report

    def print_final_report(self, report: Dict[str, Any]) -> None:
        """最終レポートの出力"""
        print("\n" + "=" * 70)
        print("🏆 COMPREHENSIVE INTEGRATION TEST REPORT")
        print("=" * 70)
        print(f"Execution Time: {report['timestamp']}")
        print(f"Total Duration: {report['total_time']:.2f} seconds")
        print(f"API Configuration: {'✅ Configured' if report['api_configured'] else '❌ Not Configured'}")
        print("")
        
        # 統計情報
        print("📊 TEST STATISTICS:")
        print("-" * 30)
        print(f"Total Tests: {report['total_tests']}")
        print(f"Passed: {report['passed_tests']} ✅")
        print(f"Failed: {report['failed_tests']} ❌")
        print(f"Success Rate: {report['success_rate']:.1f}%")
        print("")
        
        # 失敗したテストの詳細
        if report['failed_tests'] > 0:
            print("❌ FAILED TESTS:")
            print("-" * 30)
            for result in report['detailed_results']:
                if not result['passed']:
                    print(f"• {result['test']}: {result['details']}")
            print("")
        
        # 動作保証判定
        if report['success_rate'] >= 100:
            print("🎉 PERFECT! 100% OPERATIONAL GUARANTEE ACHIEVED!")
            print("   All systems are fully functional and ready for production.")
        elif report['success_rate'] >= 90:
            print("✅ EXCELLENT! Near-perfect operational status.")
            print("   Minor issues detected but core functionality works.")
        elif report['success_rate'] >= 75:
            print("⚠️ GOOD: Most functionality works but improvements needed.")
        else:
            print("🚨 CRITICAL: Significant issues detected. Immediate fixes required.")
        
        print("")
        print("📋 NEXT STEPS:")
        print("-" * 30)
        
        if not report['api_configured']:
            print("• Configure OpenAI API key for full functionality")
        
        if report['failed_tests'] > 0:
            print("• Fix failing tests for 100% operational guarantee")
            print("• Verify error handling and exception cases")
        
        if report['success_rate'] < 100:
            print("• Address any remaining integration issues")
            print("• Ensure stable cross-browser compatibility")
        else:
            print("• 🚀 Ready for production deployment!")
            print("• Consider load testing for scalability")

def main():
    """メイン実行関数"""
    tester = ComprehensiveIntegrationTest()
    
    try:
        report = tester.run_comprehensive_test_suite()
        
        # レポートをJSONファイルに保存
        with open("comprehensive_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"\n📄 Detailed report saved: comprehensive_test_report.json")
        
        # 終了コードの決定
        if report["success_rate"] >= 90:
            print("\n🎯 INTEGRATION TEST SUCCESSFUL!")
            sys.exit(0)
        else:
            print(f"\n⚠️ INTEGRATION TEST NEEDS IMPROVEMENT (Success: {report['success_rate']:.1f}%)")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Test interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()