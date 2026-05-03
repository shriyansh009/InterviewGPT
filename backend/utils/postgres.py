import psycopg2

conn = psycopg2.connect("postgresql://postgres:Shriyansh%4026@localhost:5432/interviewgpt")
cur = conn.cursor()
cur.execute("ALTER TABLE analyses ADD COLUMN matching_skills TEXT DEFAULT '[]';")
conn.commit()
cur.close()
conn.close()
print("Done!")