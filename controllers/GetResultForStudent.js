const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  try {
    console.log("Request details:", { examId, studentId });

    const allResults = await Results.find({ exam: examId })
      .sort({ overallScore: -1 })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      })
      .exec();

    console.log("All Results:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this exam." });
    }

    const validResults = allResults.filter(
      (result) => result.student && result.student.user
    );

    console.log("Valid Results:", validResults);

    if (validResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid results found for this exam." });
    }

    // Выполняем вычисления
    for (let result of validResults) {
      for (let subjectResult of result.subjects) {
        const correctAnswers = await Questions.find({
          _id: { $in: subjectResult.results.map((r) => r.questionNumber) },
        }).populate("correctOptions");

        subjectResult.totalCorrect = 0;
        subjectResult.totalIncorrect = 0;
        subjectResult.totalPoints = 0;

        for (let answer of subjectResult.results) {
          const correctOptions = correctAnswers
            .find((q) => q._id.toString() === answer.questionNumber.toString())
            .correctOptions.map((opt) => opt._id.toString());

          const isCorrect =
            answer.optionIds.every((id) => correctOptions.includes(id)) &&
            answer.optionIds.length === correctOptions.length;

          if (isCorrect) {
            subjectResult.totalCorrect++;
            subjectResult.totalPoints += correctAnswers.find(
              (q) => q._id.toString() === answer.questionNumber.toString()
            ).point;
          } else {
            subjectResult.totalIncorrect++;
          }
        }

        subjectResult.percent =
          (
            (subjectResult.totalCorrect /
              (subjectResult.totalCorrect + subjectResult.totalIncorrect)) *
            100
          ).toFixed(2) + "%";
      }

      result.overallScore = result.subjects.reduce(
        (sum, sub) => sum + sub.totalPoints,
        0
      );
      result.totalCorrect = result.subjects.reduce(
        (sum, sub) => sum + sub.totalCorrect,
        0
      );
      result.totalIncorrect = result.subjects.reduce(
        (sum, sub) => sum + sub.totalIncorrect,
        0
      );
      result.overallPercent =
        (
          (result.totalCorrect /
            (result.totalCorrect + result.totalIncorrect)) *
          100
        ).toFixed(2) + "%";

      await result.save();
    }

    const top10Results = validResults.slice(0, 10).map((result) => ({
      ...result.toObject(),
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
    }));

    const studentResult = validResults.find(
      (result) => result.student._id.toString() === studentId
    );

    console.log("Student Result:", studentResult);

    if (!studentResult) {
      return res.status(404).json({ message: "Results not found" });
    }

    const studentRank =
      validResults.findIndex(
        (result) => result.student._id.toString() === studentId
      ) + 1;

    res.status(200).json({
      top10: top10Results,
      studentResult: {
        ...studentResult.toObject(),
        student: {
          name: studentResult.student.user.name,
          surname: studentResult.student.user.surname,
        },
      },
      studentRank,
    });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res
      .status(400)
      .json({ message: "Error retrieving results", error: error.message });
  }
};

module.exports = { getResultForStudent };
