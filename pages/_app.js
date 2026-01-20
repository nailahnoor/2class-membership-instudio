import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Global CSS reset */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Stripe Elements wrapper */}
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </>
  );
}
