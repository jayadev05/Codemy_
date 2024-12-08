const Lesson=require("../model/lessonModel");



const updateLesson = async (req, res) => {
	const { ...updatedData } = req.body;
	const { lessonId } = req.params;
	try {
		console.log(updatedData, "lesson id", lessonId);

		const lesson = await Lesson.findOneAndUpdate(
			{ lessonId },
			updatedData,
			{ new: true, upsert: true }
		);
		if (lesson) {
			return res
				.status(200)
				.json({ message: "Lecture updated successfully!", lesson });
		}
	} catch (error) {
		console.log("Lecture Updating Error: ", error);
	}
};



module.exports={updateLesson};