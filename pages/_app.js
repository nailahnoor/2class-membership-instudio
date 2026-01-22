import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Global CSS reset + intl-tel-input styling */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: 'Montserrat', sans-serif;
        }

        /* intl-tel-input main input */
        .iti {
          width: 100%;
        }

        .iti__input {
          height: 48px;
          padding: 14px !important;
          font-size: 15px;
          font-family: Montserrat, sans-serif;
          box-sizing: border-box;
        }

        .iti__flag-container {
          height: 48px;
          display: flex;
          align-items: center;
        }

        /* Country dropdown list */
        .iti__country-list {
          font-family: Montserrat, sans-serif;
          max-height: 240px;
          overflow-y: auto;
        }

        /* Hide search input inside dropdown */
        .iti__country-list .iti__search {
          display: none !important;
        }

        /* Dropdown option height */
        .iti__country-list li {
          height: 48px;
          line-height: 48px;
        }
      `}</style>

      {/* Stripe Elements wrapper */}
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </>
  );
}
