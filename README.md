# How to Test the API

* Install Docker Desktop from https://www.docker.com/products/docker-desktop
* Download the Git Attachment that I've sent and put all the files in one folder to any directory that you want
* Open Command Prompt or Terminal (Windows or MacOS) to the folder directory that you've already extract
* Type "docker-compose up"
* To test the api please Install Postman from https://www.postman.com/downloads/
* Open Postman application and then import the 2 files I gave in the folder named "Gtech Test.postman_collection.json" and "Gtech API.postman_environment.json"
* First import the Collections with file "Gtech Test.postman_collection.json"
* Second import the Enviroments with file "Gtech API.postman_environment.json"
* After you import the Collection you will see Gtech Test in the Collections tab. You will see 4 api:"Create user", "Login user", "Logout user", "Delete user"
* To execute one of the 4 api don't forget to change the environment "Gtech API"

Notes: If you want to Create a user with mobile phone please use parameter "username" with prefix 62 (ex. 6281316550090)