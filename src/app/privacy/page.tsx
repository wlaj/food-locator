export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 mt-24 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, post reviews, upload photos, or contact us for support.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">Personal Information</h3>
          <ul className="list-disc pl-6">
            <li>Name and email address</li>
            <li>Profile information and photos</li>
            <li>Reviews, ratings, and photos you post</li>
            <li>Communications with us</li>
          </ul>
          <h3 className="text-lg font-medium mb-2 mt-4">Automatically Collected Information</h3>
          <ul className="list-disc pl-6">
            <li>Device information and identifiers</li>
            <li>IP address and location data</li>
            <li>Usage information and preferences</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, security alerts, and support messages</li>
            <li>Respond to comments, questions, and customer service requests</li>
            <li>Communicate with you about products, services, and promotions</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Personalize and improve user experience</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this privacy policy.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">We may share information with:</h3>
          <ul className="list-disc pl-6">
            <li>Service providers who assist in our operations</li>
            <li>Business partners for joint promotions or services</li>
            <li>Legal authorities when required by law</li>
            <li>Other parties with your consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">Types of cookies we use:</h3>
          <ul className="list-disc pl-6">
            <li>Essential cookies for basic functionality</li>
            <li>Performance cookies to analyze usage</li>
            <li>Functional cookies to remember preferences</li>
            <li>Marketing cookies for personalized content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p>
            If you have questions about this privacy policy or our data practices, please contact us through our website or email.
          </p>
        </section>
      </div>

      <div className="mt-12 text-sm text-gray-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}