const controllPostReviews = require("../../controllers/Reviews/controllGetReviews");


const postReview = async (req, res) => {
  console.log(req);
  try {
    const newReview = await controllPostReviews(req);
    res.status(201).json([newReview]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

};

module.exports = postReview;
