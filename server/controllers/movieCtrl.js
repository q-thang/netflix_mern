const Movie = require('../models/Movie');

const movieCtrl = {
  createMovie: async (req, res) => {
    if (req.user.isAdmin) {
      try {
        const {
          title,
          desc,
          poster,
          posterTitle,
          posterSm,
          trailer,
          video,
          year,
          limitAge,
          genre,
          isSeries,
        } = req.body;

        const title_movie = await Movie.findOne({ title });
        if (title_movie) {
          return res
            .status(400)
            .json({ msg: 'This movie has already existed.' });
        }

        const newMovie = new Movie({
          title,
          desc,
          poster,
          posterTitle,
          posterSm,
          trailer,
          video,
          year,
          limitAge,
          genre,
          isSeries,
        });

        await newMovie.save();

        res.json({
          msg: 'Movie has been successfully created.',
          movie: newMovie._doc,
        });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
    } else {
      res.status(403).json('You are not allowed to post a movie.');
    }
  },

  getMovie: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie)
        return res.status(400).json({ msg: 'This movie does not exist.' });
      res.json({ movie });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getRandomMovie: async (req, res) => {
    const type = req.query.type;
    let movie;
    try {
      if (type === 'series') {
        movie = await Movie.aggregate([
          { $match: { isSeries: true } },
          { $sample: { size: 1 } },
        ]);
      } else {
        movie = await Movie.aggregate([
          { $match: { isSeries: false } },
          { $sample: { size: 1 } },
        ]);
      }

      res.json({ movie });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateMovie: async (req, res) => {
    if (req.user.isAdmin) {
      try {
        const {
          title,
          desc,
          poster,
          posterTitle,
          posterSm,
          trailer,
          video,
          year,
          limitAge,
          genre,
          isSeries,
        } = req.body;

        await Movie.findByIdAndUpdate(req.params.id, {
          title,
          desc,
          poster,
          posterTitle,
          posterSm,
          trailer,
          video,
          year,
          limitAge,
          genre,
          isSeries,
        });

        res.json({ msg: 'Movie has been successfully updated.' });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
    } else {
      res.status(403).json('You are not allowed to update a movie.');
    }
  },

  deleleMovie: async (req, res) => {
    if (req.user.isAdmin) {
      try {
        await Movie.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Movie has been successfully deleted.' });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
    } else {
      res.status(403).json('You are not allowed to delete a movie.');
    }
  },
};

module.exports = movieCtrl;
