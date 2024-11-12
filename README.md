# Readme

Cybersecurity is a cyberthreat detection API, designed for users to customize their cyberdefenses.

If offers a few services. The main service consists in analysing incoming streams to detect potential threats, based on regex assessment through the help of filters.

Additionnally, there are other related services:
- Management of accounts through REST API functionnalities.
- Management of filters depending on the role of the user. admins can realise REST API operations on filters. Only staff members can see the current filters.
- Use of Kafka services: all threats end in a log file on the server and on kafka.
- The API is dockerised: easy to use, easy to customize!


# Steps
## 1. Configuration
Retrieve the API via github:
```
git clone https://github.com/GoulvenLP/cybersecurity.git
```

The project has been configured for a dockerized project, so running `npm run start` will result soon or late into errors.

You also need to configure one file:
- create a `.env` file at the root of the project in `cybersecurity/`
- fill the `.env` file with two variables: **JWT_SECRET** and **KAFKA_UUID**.

```
JWT_SECRET=someSecretHere
KAFKA_UUID=aV4UuidThere
```

  - The JWT_SECRET will be used to create authentication tokens
  - The KAFKA_UUID has to be a V4 UUID. You can generate one with an online tool like `https://www.uuidgenerator.net/version4` for instance.


Then, make sure you have docker installed on your system
```
sudo apt update
sudo apt-get install docker
```
## 2. Running the API
 Finally dockerize your application and run it
```
docker compose up --build
```
The API will autoload from then, it may take a while (around 3 minutes) because of the dependencies installation and containerization of the API.



## 3. Using the API
### 3.1 Connect to the API
There are two default profiles already configured in the API:

|username|password|role|
|--|--|--|
|cyberadmin|cyberadmin|admin|
|toto|toto1234|staff|

Both accounts are activated. An administrator and a staff member do not have the same privileges. This will be precised for the different services.

Do not forget to change the avatar names and passwords once you have taken control of them.

### 3.2 Log in
Submit your credentials:
```
POST request
{
  "username": yourUserName,
  "password": yourPassword
}
```

### 3.3. Log out
To log out, send a GET request to `/manage/logout`<br/>

## 4. Managing the watchers
- Admins can create, update, delete and see all members data.
- Staff members can only see their own account.

Only activated accounts can do such things.

### 4.1. Creating an account
Only admins can create an account.<br/>
Send a **POST** request to `/manage/create`
with:
```
{
  "username": "username",
  "password": "password",
  "role": "role",
  "email": "email"
}
```

### 4.2. Updating an account
Only admins can update an account.<br/>
If a field is let empty, the previous value will be kept unchanged.</br>
Send a **PUT** request to `/manage/update/ID` where `ID` is the ID of the user that has to be updated.
```
{
  "username": "username",
  "password": "password",
  "role": "role",
  "email": "email"
}
```
### 4.3. Accessing to an account's data
Send a **GET** request to `/manage/account/ID` where `ID` is the ID of the targeted user.

### 4.4. Accessing all accounts' data
Send a **GET** request to `/manage/account/`

### 4.5. Deleting an account
Send a **DELETE** request to `/manage/delete/ID`  where `ID` is the ID of the targeted user.

## 5. Managing the filters
The threat detection service works around the detection of matting regular expression patterns, that are created through *filters*.

Only admins can manage filters. Staff members can only see the available filters, if and only if their account is active.

### 5.1. Create a filter
Send a **POST** request to `/filters/create`
```
{
  "regex": "newRegularExpression",
  "description": "descriptionOfTheFilter",
  "type": "nameOfTheTypeOfFilter"
}
```

### 5.2. Update a filter
Send a **PUT** request to `/filters/create/ID` where `ID` is the targeted filter. If the field is let empty, it will not be updated. To clean the field, fill it with a blank space `" "`;
```
{
  "regex": "regexToUpdate",
  "description", "descriptionOfTheFilter",
  "typeName": "typeOfTheFilterToUpdate",
  }
```

### 5.3. Retrieve a filter
Send a **GET** request to `/filters/ID` where `ID` is the targeted user.

### 5.4. Retrieve all filters
Send a **GET** request to `/filters/`

### 5.5. Delete a filter
Send a **DELETE** request to `/filters/delete/ID` where `ID` is the targeted user.

## 6. Getting all logs
The log file references all threat attempts. At the top of the file are found the most recent threats while the bottom exposes the oldest threats.

Send a **GET** request to `/logs`

## 7. Passwords management
The passwords stored in the database are submitted to a radomly-created salt sequence and then hashed do SHA-512. The hashed version is stored in the database.