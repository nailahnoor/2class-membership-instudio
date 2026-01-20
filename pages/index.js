import Head from "next/head";
import SubscribeForm from "../components/SubscribeForm";

export default function Home() {
  return (
    <>
      <Head>
        <title>2 Group Classes / Monthly Membership</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Google Fonts Montserrat */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Stripe.js */}
        <script src="https://js.stripe.com/v3/"></script>
      </Head>

      {/* Full-page blue background, form centered */}
      <div style={{ background: "#00bbff", minHeight: "100vh", padding: "40px 20px" }}>
        <SubscribeForm />
      </div>
    </>
  );
}
