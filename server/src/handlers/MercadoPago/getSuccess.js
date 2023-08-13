const getSuccess = async (req, res) => {
  const info = req.query;
  const infoJSON = JSON.stringify(info);
  console.log(infoJSON);
  try {
    res
      .status(200)
      .redirect(
        `http://localhost:5173/pay-state/?data=${encodeURIComponent(infoJSON)}`
      );
  } catch (error) {
    res.status(500).json({ error: message.error });
  }
};

module.exports = getSuccess;
