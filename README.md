Step-by-Step Guide to Running the Application
1. Install Node.js 18 on your system.
2. Clone the repository.
3. Change your current directory to the `test_be` directory.
4. Run the `npm i` command to install the required dependencies.
5. To run the application via Docker, execute the following commands:
    ```
    docker-compose build --parallel
    docker-compose up
    ```
6. Wait for approximately 5 minutes until you can access the application at `http://127.0.0.1:15672/`.
7. To check the status of the email sending feature, enter the log terminal in the container app.

npx knex migrate:latest

npm test






