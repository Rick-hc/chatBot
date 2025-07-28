#!/usr/bin/env python3
"""
Excel Q&A Data Loader for Chatbot Backend
"""

import os
import glob
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ExcelQALoader:
    def __init__(self, data_dir: str = "/mnt/c/Users/8961078/Desktop/Claude/empower"):
        self.data_dir = data_dir
        self.records = []
        
    def load_excel_files(self) -> List[Dict[str, Any]]:
        """Load Q&A data from Excel files"""
        try:
            # Find all Excel files in the data directory
            pattern = os.path.join(self.data_dir, "*.xlsx")
            excel_files = glob.glob(pattern)
            
            logger.info(f"Found {len(excel_files)} Excel files: {excel_files}")
            
            records = []
            
            for file_path in excel_files:
                try:
                    # Get filename without extension for ID prefix
                    filename = os.path.splitext(os.path.basename(file_path))[0]
                    
                    # Read Excel file
                    df = pd.read_excel(file_path, header=0)
                    logger.info(f"Loaded {file_path} with {len(df)} rows")
                    
                    # Print column names for debugging
                    logger.info(f"Columns in {filename}: {list(df.columns)}")
                    
                    # Try different column naming conventions
                    question_col = None
                    answer_col = None
                    
                    # Look for common question column names
                    for col in df.columns:
                        col_str = str(col).strip().lower()
                        if col_str in ['q', 'question', '質問', 'query']:
                            question_col = col
                            break
                    
                    # Look for common answer column names  
                    for col in df.columns:
                        col_str = str(col).strip().lower()
                        if col_str in ['a', 'answer', '回答', '答え', 'response']:
                            answer_col = col
                            break
                    
                    # If specific columns not found, use first two columns
                    if question_col is None and len(df.columns) >= 2:
                        question_col = df.columns[1]  # B column (index 1)
                        logger.info(f"Using column {question_col} as question column")
                    
                    if answer_col is None and len(df.columns) >= 1:
                        answer_col = df.columns[0]  # A column (index 0)
                        logger.info(f"Using column {answer_col} as answer column")
                    
                    if question_col is None or answer_col is None:
                        logger.warning(f"Could not identify Q&A columns in {filename}")
                        continue
                    
                    # Extract Q&A pairs
                    for idx, row in df.iterrows():
                        try:
                            question = str(row[question_col]).strip()
                            answer = str(row[answer_col]).strip()
                            
                            # Skip empty or NaN entries
                            if question in ['nan', 'None', ''] or answer in ['nan', 'None', '']:
                                continue
                                
                            record = {
                                "id": f"{filename}-{idx}",
                                "question": question,
                                "answer": answer,
                                "source_file": filename,
                                "row_index": idx
                            }
                            records.append(record)
                            
                        except Exception as e:
                            logger.error(f"Error processing row {idx} in {filename}: {e}")
                            continue
                            
                except Exception as e:
                    logger.error(f"Error loading {file_path}: {e}")
                    continue
            
            logger.info(f"Successfully loaded {len(records)} Q&A records from Excel files")
            self.records = records
            return records
            
        except Exception as e:
            logger.error(f"Error in load_excel_files: {e}")
            return []
    
    def get_records(self) -> List[Dict[str, Any]]:
        """Get loaded records"""
        return self.records
    
    def print_sample_records(self, n: int = 3):
        """Print sample records for debugging"""
        sample_records = self.records[:n] if len(self.records) > n else self.records
        
        print(f"\n=== Sample Q&A Records ({len(sample_records)}/{len(self.records)}) ===")
        for record in sample_records:
            print(f"ID: {record['id']}")
            print(f"Q: {record['question'][:100]}...")
            print(f"A: {record['answer'][:100]}...")
            print(f"Source: {record['source_file']}")
            print("-" * 50)

if __name__ == "__main__":
    # Test the loader
    logging.basicConfig(level=logging.INFO)
    
    loader = ExcelQALoader()
    records = loader.load_excel_files()
    
    print(f"Loaded {len(records)} records")
    loader.print_sample_records()