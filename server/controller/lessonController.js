const Lesson=require("../model/lessonModel");



const addLesson = async (req, res) => {
	const {
		courseId,
		_id,
		lessonTitle,
		description,
		duration,
		video,
		thumbnail,
		lessonNotes,
    durationUnit
	} = req.body;

	try {

		const lesson = new Lesson({
			courseId,
			lessonId: _id,
			lessonTitle,
			description,
			duration,
      durationUnit,
			video,
			lessonThumbnail: thumbnail,
			lessonNotes,

		});

		await lesson.save();
		return res.status(200).json({ message: "Lesson added successfully!" });
	} catch (error) {
		console.log("Lesson Adding Error: ", error);
	}
};

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

module.exports={addLesson,updateLesson};