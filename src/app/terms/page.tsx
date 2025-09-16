export default function TermsPage() {
  return (
    <div className="container mx-auto mt-24 px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Food Locator, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of Food Locator per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
            <li>attempt to decompile or reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
          <p>
            Users may post reviews, photos, and other content about restaurants. By posting content, you grant Food Locator a non-exclusive, royalty-free, perpetual license to use, modify, and display your content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Restaurant Information</h2>
          <p>
            While we strive to provide accurate restaurant information, we cannot guarantee the accuracy, completeness, or timeliness of all information. Restaurant details, hours, menus, and availability may change without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
          <p>You may not use Food Locator:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
          <p>
            The materials on Food Locator are provided on an &apos;as is&apos; basis. Food Locator makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitations</h2>
          <p>
            In no event shall Food Locator or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Food Locator, even if Food Locator or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Revisions</h2>
          <p>
            The materials appearing on Food Locator could include technical, typographical, or photographic errors. Food Locator does not warrant that any of the materials on its website are accurate, complete, or current. Food Locator may make changes to the materials contained on its website at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the Netherlands and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us through our website or email.
          </p>
        </section>
      </div>

      <div className="mt-12 text-sm text-gray-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}