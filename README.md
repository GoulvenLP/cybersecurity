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
No special configuration is required


The git version of the project can be found in :
```
https://github.com/GoulvenLP/cybersecurity.git
```
If you want to run the API through the git version you will need to configure this part:
- create a `.env` file at the root of the project
- fill the `.env` file with two variables: **JWT_SECRET** and **KAFKA_UUID**.
  - The JWT_SECRET will serve create authentication tokens
  - The KAFKA_UUID has to be a V4 UUID. You can generate one with an online tool like `https://www.uuidgenerator.net/version4` for instance.

To summarize, you must create a `.env` file with:
```
JWT_SECRET=someSecretHere
KAFKA_UUID=aV4UuidThere
```

## 2. Running the API
### 2.1 Using Docker

```

```

## 3. Using the API
### 3.1 Connect to the API
For now there are two available profiles, responding to the pattern `username:password`
- cyberadmin:cyberadmin
- toto:toto1234

cyberadmin is an admin while toto is a staff member.

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

### 5.2. Retrieve all filters
Send a **GET** request to `/filters/`

### 5.5. Delete a filter
Send a **DELETE** request to `/filters/delete/ID` where `ID` is the targeted user.

## 6. Getting all logs
The log file references all threat attempts. At the top of the file are found the most recent threats while the bottom exposes the oldest threats.

Send a **GET** request to `/logs`