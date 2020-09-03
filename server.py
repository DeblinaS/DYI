# Import libraries
import os
import flask 
from flask import request,redirect,url_for, render_template, session
from google.cloud import bigquery
from random import random
from flask import jsonify
from flask_session import Session
import math
import datetime



# Initialize flask application
app_flask = flask.Flask(__name__, 
	static_url_path="/resources", 
	static_folder="./resources",
	template_folder='./interface')
app_flask.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
# 1. Establish credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./my-app-282814-078a4229c81f.json"

# 2. Establish BQ client
client = bigquery.Client()

# Define API route
@app_flask.route("/")
def root():
	if 'sessionId' in session:
		return redirect(url_for("dashboard"))
	else:
		return redirect(url_for("login"))

@app_flask.route("/login")
def login():
	if 'sessionId' in session:
		return redirect(url_for("dashboard"))
	else:
		return render_template('index.html')

@app_flask.route("/login",methods=['POST'])
def login_post():
	username=request.form.get('username')
	password="'"+request.form.get('password')+"'"
	print('credentials',username,password)
	session['sessionId']=username
	sql_query = """
		SELECT 
			*
		FROM 
			my-app-282814.stories.users as A
		WHERE 
			A.Id = {user_name}
			AND
			A.Password = {password}
	"""
	print('query done')
	# 4. Fetch results
	result = list(client.query(sql_query.format(user_name = username, password=password)))
	if result:
		return redirect(url_for("dashboard"))	

@app_flask.route("/dashboard",methods=['GET'])
def dashboard(methods=['GET']):
	if 'sessionId' in session:
		sql_query = """
		SELECT 
			A.*
		FROM 
			my-app-282814.stories.recommendations as A
  		WHERE CIN={sessionId}
  		"""
		result = list(client.query(sql_query.format(sessionId = session['sessionId'])))
		print('recommendations',result)
		return_data=result
		sql_query1 = """
				SELECT 
					A.First_Name,A.Last_Name,A.Salary_monthly,B.Credit_Limit,B.Balance,B.Card_Num
				FROM 
					my-app-282814.stories.customer as A left join my-app-282814.stories.account as B
					on A.CIN=B.CIN and B.Month='Aug'
				WHERE 
					A.CIN = {sessionId}
			"""
		result1 = list(client.query(sql_query1.format(sessionId = session['sessionId'])))
		return render_template("dashboard.html",recommendations=return_data,bal=math.floor(result1[0]['Balance']),limit=result1[0]['Credit_Limit'],first_name=result1[0]['First_Name'],last_name=result1[0]['Last_Name'],salary=result1[0]['Salary_monthly'],utilization=math.floor(result1[0]['Balance']/result1[0]['Credit_Limit']*100),Card_Num=str(result1[0]['Card_Num'])[-4:])
		# return render_template("dashboard.html")
	else:
		return redirect(url_for("login"))

@app_flask.route("/dashboard",methods=['POST'])
def dashboard_post(methods=['POST']):
	startDate="'"+request.form.get('startDate')+"'"
	endDate="'"+request.form.get('endDate')+"'"
	print('data',startDate,endDate)
	sql_query = """
		SELECT 
			Merchant_Category,count(*) as count,sum(amount) as amount
		FROM 
			my-app-282814.stories.transactions
  		WHERE CIN={sessionId} and EXTRACT(DATE FROM Transaction_Date) >= {startDate} and EXTRACT(DATE FROM Transaction_Date)<={endDate}
  		group by Merchant_Category
  		order by count DESC	
  	"""
	# 4. Fetch results
	result = list(client.query(sql_query.format(sessionId = session['sessionId'],startDate=startDate,endDate=endDate)))
	# print('result',result)
	return_data=[]
	for res in result:
		obj={
			'category':res['Merchant_Category'],
			'count':res['count']
		}
		return_data.append(obj)	
	print('return_data',return_data)
	sql_query1 = """
		SELECT 
			Merchant_Name,sum(amount) as amount
		FROM 
			my-app-282814.stories.transactions
  		WHERE CIN={sessionId} and EXTRACT(DATE FROM Transaction_Date) >= {startDate} and EXTRACT(DATE FROM Transaction_Date)<={endDate}
  		group by Merchant_Name
  		order by amount DESC
  	"""
	result1 = list(client.query(sql_query1.format(sessionId = session['sessionId'],startDate=startDate,endDate=endDate)))
	return_data1=[]
	for res in result1:
		obj={
			'merchant':res['Merchant_Name'],
			'amount':res['amount']
		}
		return_data1.append(obj)	
	print('return_data1',return_data1)
	sql_query2 = """
		SELECT 
			EXTRACT(DATE FROM Transaction_Date) as txn_dt, sum(amount) as amount
		FROM 
			my-app-282814.stories.transactions
  		WHERE CIN={sessionId} and EXTRACT(DATE FROM Transaction_Date)>= {startDate} and EXTRACT(DATE FROM Transaction_Date)<={endDate}
  		group by txn_dt
  		order by txn_dt"""
	result2 = list(client.query(sql_query2.format(sessionId = session['sessionId'],startDate=startDate,endDate=endDate)))
	return_data2=[]
	for res in result2:
		obj={
			'txn_dt':res['txn_dt'],
			'amount':res['amount']
		}
		return_data2.append(obj)	
	print('return_data2',return_data2)		
	return jsonify(category=return_data,merchant=return_data1,transactions=return_data2)

@app_flask.route("/transactions",methods=['GET'])
def transactions(methods=['GET']):
	query_params = request.args
	page = int(query_params["page"])
	if 'sessionId' in session:
			# 3. Query
		sql_query = """
				SELECT 
					A.*,B.First_Name,B.Last_Name
				FROM 
					my-app-282814.stories.transactions as A left join my-app-282814.stories.customer as B
					on A.CIN=B.CIN
				WHERE 
					A.CIN = {sessionId}
			"""
		result = list(client.query(sql_query.format(sessionId = session['sessionId'])))
		print('tran',result);
		if len(result):
			print('in if')
			return_data=result
			# query for top merchants
			# return_data=[{
			# 	'id':1,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':2,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':3,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':4,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':5,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':6,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':7,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':8,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':9,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':10,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':11,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':12,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# },{
			# 	'id':13,
			# 	'date':'12/12/12',
			# 	'amount':'200',
			# 	'dest':'abc'
			# }]
			length=len(return_data)
			start=(page-1)*10
			if length>=page*10:
				end=page*10
			else:
				end=length		
			return render_template("transactions.html",transactions = return_data[start:end],len=length,page=page,tot_page=math.ceil(length/10),first_name=return_data[0]['First_Name'],last_name=return_data[0]['Last_Name'])
		else:
			return render_template("transactions.html");	
	else:
		return redirect(url_for("login"))


@app_flask.route("/transactions",methods=['POST'])
def transactions_post(methods=['POST']):
	return'hi'		

@app_flask.route("/cards")
def cards():
	if 'sessionId' in session:
		sql_query = """
				SELECT 
					A.*
				FROM 
					my-app-282814.stories.account as A
				WHERE 
					A.CIN = {sessionId}
			"""
		result = list(client.query(sql_query.format(sessionId = session['sessionId'])))
		return_data=[]
		for res in result:
			obj={
				'mon':res['Month'],
				'lim':res['Credit_Limit'],
				'bal':math.floor(res['Balance'])
			}
			return_data.append(obj)
		return jsonify(card_bal=return_data)
	else:
		return redirect(url_for("login"))		


@app_flask.route('/logout')
def logout():
    session.pop('sessionId', None)
    return redirect(url_for('root'))		

	
app_flask.run(port=8005, host='0.0.0.0')
