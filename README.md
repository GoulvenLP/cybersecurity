# Readme

Cybersecurity is a cyberthreat detection API, designed for users to customize their cyberdefenses.

If offers a few services. The main service consists in analysing incoming streams to detect potential threats, based on regex assessment through the help of filters.


Additionnally, there are other related services:
- Management of accounts: CRUD of users with two possible roles: 'admin' or 'staff'
- Management of filters depending on the role of the user. admins can realise CRUD on filters, staff members can only see the current filters.
- Use of Kafka services: all threats end in a log file on the server and on kafka.
- The API is dockerised: easy to use, easy to customize!



```
docker run -d --name cybersecurity \
  --env JWT_SECRET=setYourSecretHere \
  cybersecurity_cont
  ```

  Replace the value of setYourSecretHere by your password.

