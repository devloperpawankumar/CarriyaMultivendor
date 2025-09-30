import React from 'react';
import Footer from '../../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full">
      {/* Top green bar */}
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      {/* Page title area */}
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-[643px] px-4 md:px-0 mt-10 text-center">
          <h1 className="text-[25px] md:text-[60px] font-bold leading-tight text-carriya-green">Privacy Policy – Carryia</h1>
        </div>
      </div>

      {/* Body content, constrained to 1160px per Figma */}
      <div className="mx-auto max-w-[1160px] px-4 md:px-0">
        {/* Intro paragraph */}
        <section className="mt-12 md:px-0 px-2">
          <p className="text-[18px] md:text-[40px] leading-[1.3] font-normal text-black">
            At Carryia (Private) Limited (“we,” “our,” or “us”), protecting your privacy and safeguarding your personal data is one of our top priorities. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, mobile application, and related services (together, the “Carryia Platform”).
          </p>
          <p className="text-[18px] md:text-[40px] leading-[1.3] font-normal text-black mt-6">
            By using Carryia, you agree to the practices described in this policy.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">1. Information We Collect</h2>
        <section className="mt-6 md:px-0 px-2">
          <div className="space-y-6">
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              When you use the Carryia Platform, we may collect the following types of data:
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Personal Information:</span> Full name, email, phone number, billing details, and government-issued ID (if required for account verification).
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Account Information:</span> Username, password, and user settings.
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Transaction Data:</span> Purchase history, payment details, and order records.
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Device & Technical Data:</span> IP address, browser type, operating system, and device identifiers.
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Location Data:</span> Approximate or precise location (if you allow it).
            </p>
            <p className="text-[18px] md:text-[40px] leading-[1.3]">
              <span className="font-medium text-carriya-green">Cookies & Tracking Data:</span> Information about browsing behavior on Carryia.
            </p>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">2. How We Use Your Information</h2>
        <section className="mt-6 space-y-6 md:px-0 px-2">
          <p className="text-[18px] md:text-[40px] leading-[1.3]">We collect and use your information to:</p>
          <ul className="list-disc pl-6 md:pl-8 space-y-4">
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Provide, operate, and improve Carryia’s marketplace services.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Process payments securely and manage your transactions.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Personalize your shopping experience.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Communicate important updates, promotions, and customer support.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Protect accounts, detect fraud, and meet legal obligations.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Conduct analytics to improve performance and reliability.</li>
          </ul>
        </section>

        {/* 3. How We Share Your Information */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">3. How We Share Your Information</h2>
        <section className="mt-6 space-y-6 md:px-0 px-2">
          <p className="text-[18px] md:text-[40px] leading-[1.3]">We respect your privacy. Carryia does not sell personal information to third parties. However, we may share your data with:</p>
          <ul className="list-disc pl-6 md:pl-8 space-y-4">
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Service Providers: Payment processors, delivery companies, cloud hosting, and IT support.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Business Partners: For promotions or collaborations (only with your consent, if required).</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Legal Authorities: When required by law, court order, or government request.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Corporate Transactions: In case of mergers, acquisitions, or transfer of assets.</li>
          </ul>
        </section>

        {/* 4. Data Security */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">4. Data Security</h2>
        <p className="mt-6 text-[18px] md:text-[40px] leading-[1.3] md:px-0 px-3  ">We use industry-standard security measures (encryption, firewalls, and access controls) to protect your information from unauthorized access or misuse. While we work hard to ensure strong security, no system is 100% risk-free.</p>

        {/* 5. Your Rights */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">5. Your Rights</h2>
        <section className="mt-6 space-y-6 md:px-0 px-2">
          <p className="text-[18px] md:text-[40px] leading-[1.3]">Depending on your country’s data protection laws, you may have the right to:</p>
          <ul className="list-disc pl-6 md:pl-8 space-y-4">
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Access a copy of your personal data.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Request corrections or deletion of your information.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Restrict or object to data processing.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Withdraw your consent where applicable.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">File a complaint with your local data protection authority.</li>
          </ul>
          <p className="text-[18px] md:text-[40px] leading-[1.3]">To exercise your rights, contact us at <span className="text-carriya-green">info@carryia.com</span>.</p>
        </section>

        {/* 6. Cookies & Tracking */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">6. Cookies & Tracking</h2>
        <section className="mt-6 space-y-4 md:px-0 px-2">
          <p className="text-[18px] md:text-[40px] leading-[1.3]">Carryia uses cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 md:pl-8 space-y-4">
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Improve site functionality.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Analyze website traffic and performance.</li>
            <li className="text-[18px] md:text-[40px] leading-[1.3]">Provide relevant offers and ads.</li>
          </ul>
          <p className="text-[18px] md:text-[40px] leading-[1.3]">You can disable cookies in your browser settings, but some features of Carryia may not work properly without them.</p>
        </section>

        {/* 7. Children’s Privacy */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">7. Children’s Privacy</h2>
        <p className="mt-6 text-[18px] md:text-[40px] leading-[1.3] md:px-0 px-3">Carryia does not knowingly collect data from children under 13 (or the minimum legal age in your country). If such data is found, we will delete it immediately.</p>

        {/* 8. International Data Transfers */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">8. International Data Transfers</h2>
        <p className="mt-6 text-[18px] md:text-[40px] leading-[1.3] md:px-0 px-3">Your information may be stored on servers outside your home country. We ensure strong protection through encryption and contractual safeguards.</p>

        {/* 9. Legal Disclaimer */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">9. Legal Disclaimer</h2>
        <p className="mt-6 text-[18px] md:text-[40px] leading-[1.3] md:px-0 px-3">Carryia takes all reasonable steps to protect your information. However, you are responsible for keeping your account credentials secure. We are not liable for unauthorized access caused by user negligence.</p>

        {/* 10. Updates to This Privacy Policy */}
        <h2 className="mt-20 text-center text-carriya-green text-[20px] md:text-[50px] font-bold">10. Updates to This Privacy Policy</h2>
        <p className="mt-6 text-[18px] md:text-[40px] leading-[1.3] mb-20 md:px-0 px-3">We may revise this Privacy Policy to reflect changes in our practices or legal requirements. The updated version will always be posted on Carryia with a “Last Updated” date.</p>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;


