# PeronaAI: Emotion & Semantic Evaluation Frontend

This is the React-based frontend for the **PeronaAI** application, a tool designed to evaluate and visualize a chatbot's performance based on its emotional intelligence and semantic relevance.

This interface allows users to upload chat logs in a specified JSON format and receive a detailed, data-driven analysis. It provides insights into a model's emotional awareness and conversational coherence through clear metrics and visualizations.

This repository is the active development home for the frontend. The backend service can be found at **[shubham-nair/EmotionEval_Chat-model-evaluate](https://github.com/shubham-nair/EmotionEval_Chat-model-evaluate)**.

## ✨ Features

-   **Seamless File Upload:** Simple drag-and-drop interface for uploading conversation logs.
-   **Detailed Session Analysis:** Get a comprehensive breakdown of each conversation turn with key metrics.
-   **Aggregated Model Summary:** Compare the performance of different models (e.g., "Alpha" vs. "Omega") across all sessions.
-   **Semantic Similarity Scores:** Quantify how well a bot's replies match the user's input context using BERTScore (F1, Precision, Recall).
-   **Emotion Trajectory Analysis:** Track the user's sentiment from the start to the end of a conversation to measure "Emotion Lift."
-   **Rich Data Visualization:** Utilizes **Recharts** for clear and insightful performance charts.
-   **Modern & Responsive UI:** Built with **Ant Design** for a clean and intuitive user experience on any device.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or later recommended)
-   npm or yarn

### Setup and Running Locally

1.  **Clone the repository and navigate into the directory:**
    ```bash
    git clone [https://github.com/shubham-nair/chatbot-emotion-eval-frontend.git](https://github.com/shubham-nair/chatbot-emotion-eval-frontend.git)
    cd chatbot-emotion-eval-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(Or `yarn install` if you use Yarn)*

3.  **Start the development server:**
    ```bash
    npm start
    ```
    The application will now be running at **`http://localhost:3000`**.

    > **Note on Backend Proxy:** For the frontend to function correctly, the backend server must also be running locally (typically on `http://localhost:8000`). This project uses a `proxy` setting in `package.json` to forward API requests from `localhost:3000` to `localhost:8000`, avoiding CORS issues during development.

## ☁️ Full-Stack Architecture & Deployment

This project is deployed on AWS, leveraging a full-stack architecture to deliver a responsive frontend and a powerful backend.

**Live Frontend URL:** **[https://d99skwii58at3k.cloudfront.net](https://d99skwii58at3k.cloudfront.net)**

### Frontend Architecture (S3 & CloudFront)

The frontend is designed for global scale and low latency using a serverless approach.

-   **AWS S3 (Simple Storage Service):** Acts as the private origin store for the application. The static files (HTML, CSS, JS) from the `npm run build` command are hosted here. The bucket is kept private to ensure secure access via CloudFront.
-   **AWS CloudFront:** Serves as the global Content Delivery Network (CDN). It securely pulls content from the S3 bucket and caches it in **edge locations** worldwide, resulting in fast load times for all users. It also provides the SSL/TLS certificate for HTTPS.
-   **AWS IAM (Identity and Access Management):** A dedicated IAM user with limited permissions is used by the GitHub Actions pipeline to securely deploy assets to S3 and invalidate the CloudFront cache.

### Backend Architecture (EC2 & FastAPI)

The backend API is a powerful Python service optimized to run a large machine learning model on a resource-constrained server.

-   **Framework:** Built with **FastAPI**, a modern, high-performance Python web framework ideal for creating APIs.
-   **Hosting:** Deployed on an **AWS EC2 t2.micro** instance, taking advantage of the AWS Free Tier.
-   **Web Server & SSL:** Uses **Caddy Server** as a reverse proxy. Caddy automatically provisions and renews SSL/TLS certificates from Let's Encrypt, providing effortless and secure HTTPS for the API.
-   **Performance Optimization (No Cold Starts):** To ensure immediate API responsiveness, the machine learning model is **pre-loaded into memory** when the FastAPI application starts. This eliminates "cold start" delays, where the first request would otherwise have to wait for the large model to be loaded.
-   **Memory Management (Swap File):** The t2.micro instance has limited RAM (1GB). To run the memory-intensive ML model, a **swap file** is configured on the EC2 instance. This allows the system to use disk space as virtual RAM, preventing out-of-memory errors and making it feasible to run the service on a free-tier machine.

### Automated Frontend Deployment

The frontend has a fully automated CI/CD pipeline using GitHub Actions.

1.  **Push to `main`:** A push to the `main` branch triggers the `.github/workflows/deploy.yml` workflow.
2.  **Build:** The workflow builds the React application.
3.  **Deploy:** It securely syncs the static build files to S3 and creates a CloudFront invalidation to purge the global cache, making the new version live instantly.

*(Note: The backend is currently deployed manually to the EC2 instance.)*

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!** This command removes the single build dependency and copies all configuration files into your project for full control.