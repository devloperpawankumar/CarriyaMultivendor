import React from 'react';
import Footer from '../../components/Footer';

const ReturnRefundPolicy: React.FC = () => {
  return (
    <div className="w-full">
      {/* Top green bar */}
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      {/* Header/title block per Figma widths */}
      <div className="mx-auto max-w-[1160px]">
        <div className="px-4 md:px-0 mt-8 md:mt-10">
          <h1 className="text-[25px] md:text-[60px] font-bold leading-tight text-carriya-green text-center">Carryia Return & Refund Policy</h1>
        </div>

        {/* Intro copy */}
        <section className="mt-8 md:mt-10 px-6 md:px-0">
          <p className="text-[16px] md:text-[40px] leading-[1.4]">
            At Carryia (Private) Limited, we aim to provide a smooth and secure shopping experience for both buyers and sellers.
            This Return & Refund Policy explains how returns, exchanges, and refunds work on the Carryia Platform (website and mobile app).
          </p>
          <p className="text-[16px] md:text-[40px] leading-[1.4] mt-4 md:mt-6">
            By shopping on Carryia, you agree to the terms below.
          </p>
        </section>

        {/* 1. General Guidelines */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">1. General Guidelines</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Carryia is a multi-vendor marketplace, and sellers are responsible for the quality of their products.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Carryia ensures sellers follow fair return and refund rules.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Products must be returned in their original condition, packaging, and with the seal unopened. Opened or tampered parcels may not be accepted.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Certain items are non-returnable due to hygiene, safety, or legal restrictions (see section below).</li>
          </ul>
        </section>

        {/* 2. Eligibility for Returns */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">2. Eligibility for Returns</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0 space-y-4 md:space-y-6">
          <p className="text-[16px] md:text-[40px] leading-[1.4]">You may request a return if:</p>
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">The item is damaged, defective, or incorrect upon delivery.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">The product received is not as described or missing parts.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">The parcel was delivered in poor condition (with proof at the time of delivery).</li>
          </ul>
          <p className="text-[16px] md:text-[40px] leading-[1.4]"><span className="text-carriya-green">Important:</span> To be eligible, the parcel seal must remain unopened, and the product must be in unused condition.</p>
          <p className="text-[16px] md:text-[40px] leading-[1.4]"><span className="text-carriya-green">Return requests</span> must be submitted within <span className="text-carriya-green">7 days</span> of delivery.</p>
        </section>

        {/* 3. Non-Returnable Items */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">3. Non-Returnable Items</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Products with opened or broken seals.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Used or damaged items caused by the customer.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Personal care and hygiene items once opened.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Customized or made-to-order items.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Perishable food or grocery items.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Products marked as “Non-Returnable” on the listing page.</li>
          </ul>
        </section>

        {/* 4. Refund Process */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">4. Refund Process</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]"><span className="text-carriya-green">Approved returns</span> must be sent back with the original seal intact and in the same packaging.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">After inspection, refunds are issued within <span className="text-carriya-green">7–14 business days</span>.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Refunds are processed through the original payment method (<span className="text-carriya-green">Bank, Easypaisa, JazzCash, Card</span>).</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">For <span className="text-carriya-green">Cash on Delivery (COD)</span> orders, refunds are issued via bank transfer or <span className="text-carriya-green">Carryia Wallet</span> credit.</li>
          </ul>
        </section>

        {/* 5. Exchange Policy */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">5. Exchange Policy</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Exchanges are allowed if the replacement item (size, color, model) is in stock.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">If the replacement is unavailable, a refund will be processed instead.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Products must still have their original seal intact for exchange eligibility.</li>
          </ul>
        </section>

        {/* 6. Order Cancellations */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">6. Order Cancellations</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Orders can be canceled before shipment.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Once dispatched, the standard return process applies.</li>
          </ul>
        </section>

        {/* 7. Return Shipping Costs */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">7. Return Shipping Costs</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]">If the return is due to a seller’s mistake (wrong, damaged, defective product), the seller covers return shipping.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">If the return is due to a customer preference (change of mind, wrong size selected), the buyer may need to cover shipping.</li>
          </ul>
        </section>

        {/* 8. Dispute Resolution */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">8. Dispute Resolution</h2>
        <section className="mt-4 md:mt-6 px-4 md:px-0">
          <ul className="list-disc list-inside md:list-outside pl-4 md:pl-8 space-y-3 md:space-y-4">
            <li className="text-[16px] md:text-[40px] leading-[1.4]"><span className="text-carriya-green">Carryia</span> monitors sellers and mediates disputes between buyers and sellers.</li>
            <li className="text-[16px] md:text-[40px] leading-[1.4]">Decisions are made fairly, with evidence from both parties.</li>
          </ul>
        </section>

        {/* 9. Contact Us */}
        <h2 className="mt-12 md:mt-16 text-center text-carriya-green text-[22px] md:text-[50px] font-bold">9. Contact Us</h2>
        <section className="mt-4 md:mt-6 px-6 md:px-0 space-y-3 md:space-y-4 mb-16 md:mb-20">
          <p className="text-[16px] md:text-[40px] leading-[1.4]">For return or refund assistance, contact:</p>
          <a
            href="/return-refund-form"
            className="text-carriya-green underline underline-offset-4 hover:text-carriya-green/80 transition-colors text-[16px] md:text-[40px] font-medium"
          >
            Click here to fill return form
          </a>
          <p className="text-[16px] md:text-[40px] leading-[1.4]">Carryia (Private) Limited</p>
          <p className="text-[16px] md:text-[40px] leading-[1.4]">📧 Email: <span className="text-carriya-green">info@carryia.com</span></p>
          <p className="text-[16px] md:text-[40px] leading-[1.4]">📞 Customer Support: <span className="text-carriya-green">+92 3146-045-045</span></p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ReturnRefundPolicy;


