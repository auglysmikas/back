const {v4: uid} = require('uuid')
const imdb = require('imdb-light')

let users = []
let posts = []

module.exports = {
    registerUser: (req, res) => {
        const {username, pass1: password} = req.body

        const user = {
            username,
            password,
            id: uid(),
            notifications: []
        }

        users.push(user)
        res.send({success: true})

    },
    login: (req, res) => {
        const {username, password} = req.body

        const user = users.find(x => x.username === username && x.password === password)

        if (user) {
            const id = user.id

            return res.send({success: true, id})
        }
        return res.send({success: false})

    },
    upload: async (req, res) => {
        const {id: movieId, secret} = req.body

        const user = users.find(x => x.id === secret)

        if (user) {

            return imdb.fetch(movieId, (details) => {

                const movie = {
                    id: uid(),
                    postCreator: user.username,
                    reviews: [],
                    poster: details.Poster,
                    title: details.Title,
                    years: details.Year,
                    rating: details.Rating,
                    genre: details.Genres,
                    director: details.Director
                }

                posts.push(movie)

                return res.send({success: true})
            })
        }

        return res.send({success: false})

    },
    getMovies: (req, res) => {
        res.send({success: true, movies: posts})
    },
    getMovie: (req, res) => {
        const {id} = req.params

        const movie = posts.find(x => x.id === id)

        res.send({success: true, movie})
    },
    makeReview: (req, res) => {
        const {rating, message, secret, postId} = req.params

        const user = users.find(x => x.id === secret)

        if (user) {

            const review = {
                rating,
                message,
                username: user.username,
            }

            const post = posts.find(x => x.id === postId)
            post.reviews.push(review)

            return res.send({success: true})
        }

        res.send({success: false})

    },
}