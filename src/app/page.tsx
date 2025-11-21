import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="">
        <section className="relative h-[80vh] bg-[url('/images/hero.webp')] bg-cover bg-center bg-no-repeat flex items-center px-6">
          <div className="absolute inset-0 max-md:bg-black/40"></div>

          <div className="relative z-10 max-md:text-white md:ml-30 md:text-left max-md:text-center md:max-w-100 max-md:w-full">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold transition-all duration-700">
              Explore a Handcraft world.
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl transition-all duration-700">
              100% Handmade.
            </p>

            <button className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-200 hover:text-black transition duration-300">
              See Products
            </button>
          </div>
        </section>
        <div className="container mx-auto md:px-30 md:py-30 max-md:px-10 max-md:py-10 space-y-12">
          {/* image 1 */}
          <div className="flex flex-col md:flex-row items-center p-7 rounded-2xl">
            <Image
              className="w-120 h-120 object-cover shadow-xl rounded-md"
              alt=""
              src="/images/image1.webp"
            />
            <p className="text-xl md:text-3xl font-medium md:ml-8 mt-6 md:mt-0 text-center md:text-justify">
              Our handcrafted creations carry stories, details, and emotions that only human hands can transmit.
            </p>
          </div>

          {/* image 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center p-7 rounded-2xl">
            <Image
              className="w-120 h-120 object-cover shadow-xl rounded-md"
              alt=""
              src="/images/image2.webp"
            />
            <p className="text-xl md:text-3xl font-medium md:mr-8 mt-6 md:mt-0 text-center md:text-justify">
              Transform your space with handcrafted pieces carefully created to bring warmth, style, and personality to your everyday life.
            </p>
          </div>

          {/* image 3 */}
          <div className="flex flex-col md:flex-row items-center p-7 rounded-2xl">
            <Image
              className="w-120 h-120 object-cover shadow-xl rounded-md"
              alt=""
              src="/images/image3.webp"
            />
            <p className="text-xl md:text-3xl font-medium md:ml-8 mt-6 md:mt-0 text-center md:text-justify">
              Our craftsmanship invites you to slow down and appreciate the small beauties in every texture, curve, and detail.
            </p>
          </div>
        </div>



      </main>
      <Footer />
    </div>
  );
}
