import React from 'react';
import Footer from '../../components/Footer';
import Blogpagehero from '../../assets/images/Blog/m-post-card-overlay.png';
import Post from '../../assets/images/Blog/Rectangle 38.png';
import Author from '../../assets/images/Blog/auth.png';
import Authorimg from '../../assets/images/Blog/authimage.png';


function getOptionalImage(relativePath: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`${relativePath}`);
  } catch {
    return '';
  }
}

const posts = [
  { id: 1, imageName: 'post1.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 2, imageName: 'post2.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 3, imageName: 'post3.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 4, imageName: 'post4.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 5, imageName: 'post5.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 6, imageName: 'post6.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 7, imageName: 'post7.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 8, imageName: 'post8.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' },
  { id: 9, imageName: 'post9.png', title: 'The Impact of Carryia on the Workplace: How Carryia Technology is Changing', badge: 'Tech App', author: 'Tracey Wilson', date: 'August 20, 2022' }
];

const BlogPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>
      <div className="mx-auto max-w-[1216px] px-4 sm:px-6 lg:px-0">
        <div className="mt-8 grid place-items-center text-center">
          <h1 className="text-[32px] leading-[1.2] font-semibold md:text-[56px]">Explore Our<br />
           <span className="text-carriya-green">Recent Blog </span> Posts</h1>
        </div>

        <div className="mt-6">
          <div className="relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[380px] md:h-[450px]">
            {/* If image is missing, this still renders a space as requested */}
            <img
              src={Blogpagehero as unknown as string}
              alt="Blog hero"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(20,22,36,0.4)]" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#2ECC71] px-3 py-1 text-[14px] font-medium text-white">Tech App</span>
              </div>
              <h2 className="mt-4 max-w-[720px] text-left text-white text-[22px] leading-tight md:text-[36px]">
                The Impact of Carryia on the Workplace: How carryia Technology is Changing
              </h2>
              <div className="mt-4 flex items-center gap-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-white/20">
                    <img
                      src={Author as unknown as string}
                      alt="Author"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[16px] font-medium">Tracey Wilson</span>
                </div>
                <span className="text-[16px]">August 20, 2022</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid 1 */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map(post => (
            <article key={post.id} className="rounded-xl border border-[#E8E8EA] p-4">
              <div className="h-[240px] w-full overflow-hidden rounded-md bg-gray-100">
                <img src={Post as unknown as string} alt="Post" className="h-full w-full object-cover" />
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#E9FFF2] px-3 py-1 text-[14px] font-medium text-[#181A2A]">{post.badge}</span>
                </div>
                <h3 className="text-[20px] font-semibold leading-snug text-[#181A2A]">{post.title}</h3>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                      <img src={Authorimg as unknown as string} alt="Author" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[16px] font-medium text-[#181A2A]">{post.author}</span>
                  </div>
                  <span className="text-[16px] text-[#97989F]">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Grid 2 */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(3, 6).map(post => (
            <article key={post.id} className="rounded-xl border border-[#E8E8EA] p-4">
              <div className="h-[240px] w-full overflow-hidden rounded-md bg-gray-100">
                <img src={Post as unknown as string} alt="Post" className="h-full w-full object-cover" />
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#E9FFF2] px-3 py-1 text-[14px] font-medium text-[#181A2A]">{post.badge}</span>
                </div>
                <h3 className="text-[20px] font-semibold leading-snug text-[#181A2A]">{post.title}</h3>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                      <img src={Authorimg as unknown as string} alt="Author" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[16px] font-medium text-[#181A2A]">{post.author}</span>
                  </div>
                  <span className="text-[16px] text-[#97989F]">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Grid 3 */}
        <div className="mt-10 mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(6, 9).map(post => (
            <article key={post.id} className="rounded-xl border border-[#E8E8EA] p-4">
              <div className="h-[240px] w-full overflow-hidden rounded-md bg-gray-100">
                <img src={Post as unknown as string} alt="Post" className="h-full w-full object-cover" />
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#E9FFF2] px-3 py-1 text-[14px] font-medium text-[#181A2A]">{post.badge}</span>
                </div>
                <h3 className="text-[20px] font-semibold leading-snug text-[#181A2A]">{post.title}</h3>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                      <img src={Authorimg as unknown as string} alt="Author" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[16px] font-medium text-[#181A2A]">{post.author}</span>
                  </div>
                  <span className="text-[16px] text-[#97989F]">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;


