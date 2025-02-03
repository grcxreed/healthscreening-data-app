#!/usr/bin/env python3
# usage python3 wellness_score_check.py 
import pandas as pd
import sys
import json

def process_health_data(file_path):
    try:
        # Load the CSV file into a DataFrame
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Ensure numeric columns are treated as numbers
    df['Chol'] = pd.to_numeric(df['Chol'], errors='coerce')
    df['Glu'] = pd.to_numeric(df['Glu'], errors='coerce')
    df['BP (sys)'] = pd.to_numeric(df['BP (sys)'], errors='coerce')
    df['BP (dia)'] = pd.to_numeric(df['BP (dia)'], errors='coerce')
    df['Fasting'] = pd.to_numeric(df['Fasting'], errors='coerce')

    # Function to calculate the intermediate wellness score for cholesterol
    def chol_wellness_score(chol):
        if pd.isna(chol):
            return 0
        elif chol < 200:
            return 2
        elif 200 <= chol <= 239:
            return 1
        else:
            return 0

    # Function to calculate the intermediate wellness score for glucose
    def glu_wellness_score(glu, fasting):
        if pd.isna(glu) or pd.isna(fasting):
            return 0
        if fasting == 1:
            if 70 <= glu <= 100:
                return 2
            elif 101 <= glu <= 125:
                return 1
            else:
                return 0
        else:
            if 70 <= glu <= 140:
                return 2
            elif 141 <= glu <= 200:
                return 1
            else:
                return 0

    # Function to calculate the intermediate wellness score for blood pressure
    def bp_wellness_score(bp_sys, bp_dia):
        if pd.isna(bp_sys) or pd.isna(bp_dia):
            return 0
        if bp_sys <= 120 and bp_dia <= 80:
            return 2
        elif 120 <= bp_sys <= 139 and 81 <=bp_dia <= 90:
            return 1
        else:
            return 0

    # Calculate intermediate wellness scores
    df['Intermediate Wellness Score'] = df.apply(
        lambda row: chol_wellness_score(row['Chol']) if row['Test'] == 'Cholesterol' else (
            glu_wellness_score(row['Glu'], row['Fasting']) if row['Test'] == 'Glucose' else (
                bp_wellness_score(row['BP (sys)'], row['BP (dia)']) if row['Test'] == 'BP' else 0
            )
        ), axis=1
    )

    # Calculate the overall wellness score for each individual by averaging the intermediate wellness scores
    df['Wellness Score'] = df.groupby(['Last Name', 'First Name', 'Date'])['Intermediate Wellness Score'].transform('mean')

    # Drop duplicates to keep only one row per individual with the overall wellness score
    df_final = df.drop_duplicates(subset=['Last Name', 'First Name', 'Date']).reset_index(drop=True)

    # Save the processed data to a JSON file
    output_data = df_final[['Last Name', 'First Name', 'Date', 'Intermediate Wellness Score', 'Wellness Score']].to_dict(orient='records')
    with open('output.json', 'w') as json_file:
        json.dump(output_data, json_file, indent=4)

    # Return the final DataFrame
    return df_final[['Last Name', 'First Name', 'Date', 'Intermediate Wellness Score', 'Wellness Score']]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: ./wellness_score.py <csv_file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    processed_data = process_health_data(file_path)

    # Display the processed data
    print(processed_data)

