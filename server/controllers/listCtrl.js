const { mongo } = require("mongoose");
const List = require("../models/List");

const listCtrl = {
  createList: async (req, res) => {
    //if (req.user.isAdmin) {
    try {
      const { title, type, genre, content } = req.body;

      const title_movie = await List.findOne({ title });
      if (title_movie) {
        return res.status(400).json({ msg: "This movie has already existed." });
      }

      const newList = new List({
        title,
        type,
        genre,
        content,
      });

      await newList.save();

      res.json({
        msg: "List of movies has been successfully created.",
        movie: newList._doc,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
    //} else {
    //  res.status(403).json("You are not allowed to create a list.");
    //}
  },

  getList: async (req, res) => {
    const typeQuery = req.query.type;
    const genreQuery = req.query.genre;
    let list = [];

    try {
      if (typeQuery) {
        if (genreQuery) {
          list = await List.aggregate([
            { $sample: { size: 10 } },
            {
              $lookup: {
                from: "movies",
                localField: "content",
                foreignField: "_id",
                as: "result",
              },
            },
            { $match: { type: typeQuery, genre: genreQuery } },
          ]);
        } else {
          list = await List.aggregate([
            { $sample: { size: 10 } },
            {
              $lookup: {
                from: "movies",
                localField: "content",
                foreignField: "_id",
                as: "result",
              },
            },
            { $match: { type: typeQuery } },
          ]);
        }
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "movies",
              localField: "content",
              foreignField: "_id",
              as: "result",
            },
          },
        ]);
      }

      res.json(list);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getRecommendList: async (req, res) => {
    try {
      const transId = mongo.ObjectId(req.params.id);
      const recommendList = await List.aggregate([
        {
          $lookup: {
            from: "movies",
            localField: "content",
            foreignField: "_id",
            as: "result",
          },
        },
        { $match: { content: { $in: [transId] } } },
        {
          $project: {
            result: 1,
          },
        },
        { $sample: { size: 1 } },
      ]);

      res.json(recommendList);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateList: async (req, res) => {
    if (req.user.isAdmin) {
      try {
        const { title, type, genre, content } = req.body;

        await List.findByIdAndUpdate(req.params.id, {
          title,
          type,
          genre,
          content,
        });

        res.json({ msg: "List of movies has been successfully updated." });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
    } else {
      res.status(403).json("You are not allowed to update a list.");
    }
  },

  deleteList: async (req, res) => {
    if (req.user.isAdmin) {
      try {
        await List.findByIdAndDelete(req.params.id);

        res.json({ msg: "List of movies has been successfully deleted." });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
    } else {
      res.status(403).json("You are not allowed to delete a list.");
    }
  },
};

module.exports = listCtrl;
