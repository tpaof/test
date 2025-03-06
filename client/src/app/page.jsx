"use client"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Calendar, Star, Heart } from "lucide-react"
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [specialTourCards, setSpecialTourCards] = useState([])
  const [recommendTourCards, setRecommendTourCards] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const heroImages = [
    "/1.jpg",
    "/login-pic.png",
    "/hero.jpg",
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }, [heroImages])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Fetch Special Offers (lowest price - top 3)
  useEffect(() => {
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/packages?populate=images,reviews&sort=price:asc&pagination[limit]=3`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData =
          data?.data?.map((offer) => ({
            id: offer.id,
            image: offer.attributes?.images?.data?.[0]?.attributes?.url
              ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${offer.attributes.images.data[0].attributes.url}`
              : "/1.jpg",
            title: offer.attributes?.title || "No Title",
            rating: offer.attributes?.reviews?.data?.length
              ? (offer.attributes.reviews.data.reduce((sum, r) => sum + r.attributes.rating, 0) /
                offer.attributes.reviews.data.length).toFixed(1)
              : 0,
            reviews: offer.attributes?.reviews?.data?.length || 0,
            capacity: offer.attributes?.capacity || "N/A",
            duration: offer.attributes?.duration || "N/A",
            price: offer.attributes?.price ? `THB ${offer.attributes.price.toLocaleString()}` : "THB X,XXX",
            isSellOut: offer.attributes?.isAvailable === "sold_out",
          })) || []

        setSpecialTourCards(formattedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching special offers:", error)
        setError("Failed to load special offers. Please try again later.")
        setLoading(false)
      })
  }, [])

  // Fetch Recommended Packages (highest rating - top 3)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/packages?populate=images,reviews`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData =
          data?.data
            ?.map((pkg) => ({
              id: pkg.id,
              image: pkg.attributes?.images?.data?.[0]?.attributes?.url
                ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${pkg.attributes.images.data[0].attributes.url}`
                : "/1.jpg",
              title: pkg.attributes?.title || "No Title",
              rating: pkg.attributes?.reviews?.data?.length
                ? (pkg.attributes.reviews.data.reduce((sum, r) => sum + r.attributes.rating, 0) /
                  pkg.attributes.reviews.data.length).toFixed(1)
                : 0,
              reviews: pkg.attributes?.reviews?.data?.length || 0,
              capacity: pkg.attributes?.capacity || "N/A",
              duration: pkg.attributes?.duration || "N/A",
              price: pkg.attributes?.price ? `THB ${pkg.attributes.price.toLocaleString()}` : "THB X,XXX",
              isSellOut: pkg.attributes?.isAvailable === "sold_out",
            }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3) || []

        setRecommendTourCards(formattedData)
      })
      .catch((error) => {
        console.error("Error fetching recommended packages:", error)
        setError("Failed to load recommended packages. Please try again later.")
      })
  }, [])

  // Fetch Reviews (top 2 recent reviews)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reviews?populate=users_permissions_user&sort=createdAt:desc&pagination[limit]=2`)
      .then((res) => res.json())
      .then((data) => {
        const formattedReviews =
          data?.data?.map((review) => ({
            rating: review.attributes.rating,
            author: review.attributes.users_permissions_user?.data?.attributes.username || "Anonymous",
            text: review.attributes.comment || "No comment provided",
            time: new Date(review.attributes.createdAt).toLocaleString(),
          })) || []
        setReviews(formattedReviews)
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error)
        setError("Failed to load reviews. Please try again later.")
      })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentSlide] || "/placeholder.svg"}
              alt="Hero image"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl text-white font-bold mb-4 text-center"
          >
            Let's go with PET
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-xl mb-8 text-center"
          >
            Plan better with travel experiences!
          </motion.p>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 transition-colors p-2 rounded-full text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 transition-colors p-2 rounded-full text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-5xl font-bold text-[#2A8470] mb-8"
        >
          Special Offers
        </motion.h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {specialTourCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/Package/${card.id}`} passHref>
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  >
                    <div className="relative h-48">
                      <Image src={card.image || "/placeholder.svg"} alt={card.title} fill className="object-cover" />
                      {card.isSellOut && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm z-10">
                          Sell Out
                        </div>
                      )}
                      <motion.button
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full z-10"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">{card.rating}</span>
                          <span className="text-gray-500 ml-1">({card.reviews})</span>
                        </div>
                        <span className="text-gray-500">{card.capacity}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{card.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">from</span>
                          <span className="text-xl font-bold text-blue-600 ml-1">{card.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Package Section */}
      <div className="container mx-auto px-4 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-5xl font-bold text-[#2A8470] mb-8"
        >
          Recommended Package
        </motion.h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {recommendTourCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/infomation/${card.id}`} passHref>
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  >
                    <div className="relative h-48">
                      <Image src={card.image || "/placeholder.svg"} alt={card.title} fill className="object-cover" />
                      {card.isSellOut && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm z-10">
                          Sell Out
                        </div>
                      )}
                      <motion.button
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full z-10"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">{card.rating}</span>
                          <span className="text-gray-500 ml-1">({card.reviews})</span>
                        </div>
                        <span className="text-gray-500">{card.capacity}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{card.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">from</span>
                          <span className="text-xl font-bold text-blue-600 ml-1">{card.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Free Cancellation Section */}
      <div className="bg-gray-50 py-16 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold text-[#2A8470] mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            >
              Free cancellation
            </motion.h2>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              You'll receive a full refund if you cancel at least
              <br />
              24 hours in advance of most experiences.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-2">Excellent</h3>
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ rotate: -30, opacity: 0 }}
                  whileInView={{ rotate: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Star className="w-8 h-8 text-[#2A8470] fill-current" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Based on dynamic reviews</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#2A8470] fill-current" />
                    ))}
                  </div>
                  <p className="font-semibold mb-1">{review.author}</p>
                  <p className="text-gray-600 text-sm mb-2">{review.text}</p>
                  <p className="text-gray-400 text-sm">{review.time}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No reviews available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2D776E] text-white py-8 w-full">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
              <Image src="/logoW.png" alt="PETI Logo" width={170} height={90} />
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="font-semibold">Contact us</p>
              <p>yimwired@gmail.com</p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="font-semibold">About</p>
              <p>@PET2025</p>
            </motion.div>

            <div className="flex gap-4">
              {[Facebook, Instagram, MessageCircle, Twitter].map((Icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link href="#" className="hover:text-[#24685F]">
                    <Icon className="w-6 h-6" />
                    <span className="sr-only">{Icon.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage