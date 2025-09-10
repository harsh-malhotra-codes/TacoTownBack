# TacoTown Backend

This is the backend for TacoTown, built with Express.js and Supabase.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   PORT=3000
   ```

4. For Cyclic deployment:
   - Push this code to a GitHub repository
   - Go to https://www.cyclic.sh/
   - Click "Deploy from GitHub"
   - Select your backend repository
   - Cyclic will auto-deploy

## API Endpoints

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:orderId` - Update order status
- `DELETE /api/orders/:orderId` - Delete order
- `POST /contact` - Handle contact form
- `GET /health` - Health check

## Environment Variables

Make sure to set these in your Cyclic environment:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
