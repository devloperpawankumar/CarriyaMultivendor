import React from 'react';
import Footer from '../../components/Footer';
import Aboutushero from '../../assets/images/Blog/Banner 1.png';
import Aboutushero2 from '../../assets/images/Blog/OurMission.png';
import Aboutushero3 from '../../assets/images/Blog/CEO banner.png';
import Header from '../../components/Header';

function getOptionalImage(relativePath: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`${relativePath}`);
  } catch {
    return '';
  }
}

const AboutUs: React.FC = () => {
  return (
    
    <div className="w-full">
      <Header variant='full' />
      
     

      <div className="mx-auto max-w-[1216px] px-4 sm:px-6 lg:px-0">
        {/* Title */}
        <div className="mt-10 grid place-items-center text-center">
          <h1 className="text-[40px] md:text-[60px] font-bold">About Us</h1>
        </div>

        {/* Image under About Us */}
        <div className="mt-8">
          <div className="w-full rounded-[25px] bg-gray-100">
            <img src={Aboutushero as unknown as string} alt="About banner" className="w-full h-auto rounded-[25px] object-contain" />
          </div>
        </div>

        {/* Intro paragraph */}
        <div className="mt-10 text-[18px] md:px-0 px-2 md:text-[40px] leading-[1.3] font-medium">
          <p>
            Welcome to <span className="text-carriya-green">Carryia</span>, your trusted multi-vendor marketplace. We provide a digital space where
            buyers and sellers connect, creating opportunities for businesses of all sizes. From electronics to fashion, from home
            essentials to fitness gear, <span className="text-carriya-green">Carryia</span> is where variety meets convenience.
          </p>
          <p className="mt-6">
            We aim to make online shopping in Pakistan affordable, reliable, and secure.
            Our platform is designed to empower vendors with the tools they need to grow and give customers the seamless
            experience they deserve.
          </p>
        </div>

        {/* Our Mission */}
        <div className="mt-20">
          <h2 className="text-[40px] md:text-[60px] font-bold text-center">Our Mission</h2>

              {/* Image under Our Mission */}
          <div className="mt-8">
            <div className="w-full rounded-[25px] bg-gray-100">
              <img src={Aboutushero2 as unknown as string} alt="Mission banner" className="w-full h-auto  rounded-[25px] object-contain" />
            </div>
          </div>
          <div className="mt-8 text-[18px] md:px-0 px-2 md:text-[40px] leading-[1.3] font-medium">
            <p>
              At <span className="text-carriya-green">Carryia</span>, our mission is to make online shopping in Pakistan
              <span className="text-carriya-green"> affordable</span>, <span className="text-carriya-green">reliable</span>, <span className="text-carriya-green">and</span>  
              <span className="text-carriya-green"> convenient</span> for everyone. We aim to create a trusted <span className="text-carriya-green">multi-vendor marketplace</span> where buyers discover a wide variety of
              products from electronics and fashion to home essentials and fitness gear while empowering sellers to grow their businesses with ease.
            </p>
            <p className="mt-6">
              We are committed to building a secure digital platform that connects customers with quality products at competitive prices,
              ensuring a smooth shopping experience from order to delivery. For sellers, our goal is to provide powerful tools,
              transparent policies, and fair opportunities to succeed in the growing world of e-commerce in Pakistan.
            </p>
            <p className="mt-6">
              By bridging the gap between buyers and sellers, Carryia strives to shape the future of online shopping where ,
                 <span className="text-carriya-green">variety meets convenience, trust, and growth</span> .
            </p>
          </div>
      
        </div>

        {/* CEO Vision */}
        <div className="mt-20 mb-24">
          <h2 className="text-[40px] md:text-[60px] font-bold text-center">Our CEO Vision</h2>

             {/* Image under CEO Vision */}
          <div className="mt-8">
            <div className="w-full rounded-[25px] bg-gray-100">
              <img src={Aboutushero3 as unknown as string} alt="CEO vision banner" className="w-full h-auto rounded-[25px] object-contain" />
            </div>
          </div>
          <div className="mt-8 text-[18px] md:px-0 px-2 md:text-[40px] leading-[1.3] font-medium">
            <p>
              As the CEO of Carryia, I, <span className="text-carriya-green">Muhammad Wasif Bhatti</span>, envision building Pakistan’s most trusted and
              innovative <span className="text-carriya-green">multi-vendor e-commerce marketplace</span> that empowers sellers, supports businesses, and delivers real value to customers.
              Carryia is not just an online shopping platform – it is a digital ecosystem designed to connect entrepreneurs with opportunities and buyers with convenience,
              trust, and affordability.
            </p>
            <p className="mt-6">
              My vision is to make Carryia a platform where <span className="text-carriya-green">small and medium-sized businesses thrive</span> , where sellers gain the tools, visibility, and technology to grow,
              and where customers enjoy a seamless and secure shopping experience. We aim to set new standards in  <span className="text-carriya-green">transparency, fairness, and customer satisfaction</span> ,
              ensuring that every interaction on Carryia creates trust and long-term value.
            </p>
            <p className="mt-6">
              With innovation at the heart of our strategy, Carryia is committed to shaping the <span className="text-carriya-green">future of e-commerce in Pakistan</span>     by combining modern technology,
              strong customer support, and a seller-first approach. I believe that digital commerce should be inclusive, affordable, and reliable – values that define every decision we make at
               Carryia.
            </p>
            <p className="mt-6">
              Together with our dedicated team, I am determined to see Carryia grow into a household name, a symbol of trust for buyers, and a partner in growth for sellers.
              Our vision is clear: to make Carryia  <span className='text-carriya-green'>the leading e-commerce marketplace in Pakistan </span> , driving progress for businesses, delight for customers, and strength for the digital economy.
            </p>
            <p className="mt-6 text-carriya-green"><span className="block">— Muhammad Wasif Bhatti</span><span className="block">CEO, Carryia</span></p>
          </div>
       
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;


