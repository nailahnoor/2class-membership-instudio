import { useState, useRef, useEffect } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ✅ Import countries and regions data
import { COUNTRY_CODES, COUNTRIES } from "../data/countries";
import { REGIONS } from "../data/regions";

export default function SubscribeForm() {
  const stripe = useStripe();
  const elements = useElements();
  const phoneCountrySelectRef = useRef(null);
  const billingCountrySelectRef = useRef(null);

  const [contactName, setContactName] = useState("");
  const [billingName, setBillingName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("US");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phonePlaceholder, setPhonePlaceholder] = useState("(201) 555‑0123");

  const REGION_LABELS = {
    US: "State",
    CA: "Province",
    AU: "State / Territory",
    IN: "State",
  };

  const cardStyle = {
    style: {
      base: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "16px",
        color: "#1f2937",
        "::placeholder": { color: "#9ca3af", fontFamily: "Montserrat, sans-serif" },
      },
      invalid: { color: "#b42318" },
    },
  };

  const inputBase = {
    width: "100%",
    padding: "14px",
    border: "none",
    fontSize: "15px",
    fontFamily: "Montserrat, sans-serif",
    outline: "none",
  };

  const groupBox = {
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
    background: "white",
  };

  const divider = { borderBottom: "1px solid #e5e7eb" };
  const vDivider = { width: "1px", background: "#e5e7eb" };

  const selectStyle = {
    ...inputBase,
    appearance: "none",
    paddingRight: "48px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 18px center",
    color: "#1f2937",
  };

  const phoneRegions = REGIONS[phoneCountry] || [];
  const billingRegions = REGIONS[billingCountry] || [];

  useEffect(() => {
    const countryData = COUNTRY_CODES.find((c) => c.code === phoneCountry);
    if (countryData && countryData.placeholder) {
      setPhonePlaceholder(countryData.placeholder);
    } else {
      setPhonePlaceholder("(201) 555‑0123");
    }
    setPhone("");
  }, [phoneCountry]);

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    const countryData = COUNTRY_CODES.find((c) => c.code === phoneCountry);
    if (!countryData || !countryData.placeholder) {
      setPhone(e.target.value);
      return;
    }

    const placeholderDigits = countryData.placeholder.replace(/\D/g, "");
    let formatted = "";
    let digitIndex = 0;

    for (let i = 0; i < countryData.placeholder.length; i++) {
      if (/\d/.test(countryData.placeholder[i])) {
        formatted += input[digitIndex] || "";
        digitIndex++;
      } else {
        if (digitIndex < input.length) formatted += countryData.placeholder[i];
      }
    }

    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!termsChecked) {
      setErrorMessage("You must agree to the purchase terms.");
      return;
    }

    const countryData = COUNTRY_CODES.find((c) => c.code === phoneCountry);
    const enteredDigits = phone.replace(/\D/g, "");
    const expectedDigits = (countryData?.placeholder || "").replace(/\D/g, "").length;
    if (!enteredDigits || enteredDigits.length !== expectedDigits) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet.");
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardNumberElement);

      let dialCode = countryData?.dial || "";
      if (dialCode && !dialCode.startsWith("+")) dialCode = "+" + dialCode;
      const digitsOnly = phone.replace(/\D/g, "");
      const phoneForStripe = `${dialCode} ${digitsOnly}`;

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: billingName,
          email,
          phone: phoneForStripe,
          address: {
            country: billingCountry,
            line1: address1,
            line2: address2,
            city,
            postal_code: zip,
            state,
          },
        },
      });

      if (error) throw new Error(error.message);

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email,
          phone: phoneForStripe,
          paymentMethodId: paymentMethod.id,
          address: {
            country: billingCountry,
            line1: address1,
            line2: address2,
            city,
            postal_code: zip,
            state,
          },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccessMessage("Subscription successful!");
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  // ✅ Mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isMobile ? "white" : "#00bbff",
        display: "flex",
        justifyContent: "center",
        padding: isMobile ? "0px" : "40px 16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: isMobile ? "0px" : "18px",
          maxWidth: "520px",
          width: "100%",
          padding: isMobile ? "16px" : "28px",
          boxShadow: isMobile ? "none" : "0 12px 32px rgba(0,0,0,0.15)",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Subscribe to 2 Group Classes / Monthly Membership / In-Studio ($45)
        </h1>

        <form onSubmit={handleSubmit}>
          {/* CONTACT DETAILS */}
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Contact details
          </h3>

          <div style={groupBox}>
            <div style={divider}>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputBase}
              />
            </div>

            <div style={divider}>
              <input
                type="text"
                placeholder="Full name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                style={inputBase}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <select
                ref={phoneCountrySelectRef}
                value={phoneCountry}
                onChange={(e) => setPhoneCountry(e.target.value)}
                style={{
                  ...inputBase,
                  minWidth: isMobile ? "50px" : "60px",
                  maxWidth: isMobile ? "60px" : "70px",
                  padding: isMobile ? "4px" : "6px",
                  fontSize: "14px",
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.dial} — {c.name}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                placeholder={phonePlaceholder}
                value={phone}
                onChange={handlePhoneChange}
                required
                style={{ ...inputBase, flex: 1 }}
              />
            </div>
          </div>

          {/* CARD INFORMATION */}
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Card information
          </h3>

          <div style={groupBox}>
            <div style={divider}>
              <input
                type="text"
                placeholder="Full name on card"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                required
                style={inputBase}
              />
            </div>

            <div style={divider}>
              <div style={{ padding: "14px" }}>
                <CardNumberElement options={cardStyle} />
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "14px" }}>
                <CardExpiryElement options={cardStyle} />
              </div>
              <div style={vDivider} />
              <div style={{ flex: 1, padding: "14px" }}>
                <CardCvcElement options={cardStyle} />
              </div>
            </div>
          </div>

          {/* BILLING ADDRESS */}
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Billing address
          </h3>

          <div style={groupBox}>
            <div style={divider}>
              <select
                ref={billingCountrySelectRef}
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                style={selectStyle}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={divider}>
              <input
                type="text"
                placeholder="Address"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                style={inputBase}
              />
            </div>

            <div style={divider}>
              <input
                type="text"
                placeholder="Address line 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                style={inputBase}
              />
            </div>

            {billingRegions.length > 0 ? (
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{ ...inputBase, flex: 1 }}
                />
                <div style={vDivider} />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  style={{ ...inputBase, flex: 1 }}
                />
                <div style={vDivider} />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  style={{ ...selectStyle, flex: 1 }}
                >
                  <option value="" disabled>
                    {REGION_LABELS[billingCountry] || "State"}
                  </option>
                  {billingRegions.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{ ...inputBase, flex: 1 }}
                />
                <div style={vDivider} />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  style={{ ...inputBase, flex: 1 }}
                />
              </div>
            )}
          </div>

          {/* TERMS */}
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>
            Purchase Terms
          </h3>

          <ul
            style={{
              fontSize: "13px",
              paddingLeft: "18px",
              marginBottom: "20px",
              lineHeight: "1.7",
            }}
          >
            <li>The first month is charged in full at checkout and is not prorated, regardless of purchase date.</li>
            <li>Purchase grants access to classes immediately and through the end of the current calendar month.</li>
            <li>Recurring billing occurs on the 1st of each month.</li>
            <li>Classes must be used within the calendar month in which they are purchased.</li>
            <li>Unused classes expire at the end of the month and cannot be carried over to the next month or transferred to another person.</li>
            <li>All sales are final. No refunds, credits, or exchanges.</li>
            <li>Memberships automatically renew on the 1st of each month unless canceled before the next billing date via the Stripe Customer Portal.</li>
          </ul>

          <label
            style={{
              fontSize: "13px",
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              style={{ accentColor: "#ff9900" }}
            />
            I have read and agree to the purchase terms.
          </label>

          {errorMessage && (
            <div style={{ color: "#b42318", marginBottom: "12px" }}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={{ color: "#027a48", marginBottom: "12px" }}>
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            style={{
              width: "100%",
              padding: "16px",
              background: "#ff9900",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {loading ? "PROCESSING…" : "SUBSCRIBE"}
          </button>
        </form>
      </div>
    </div>
  );
}
