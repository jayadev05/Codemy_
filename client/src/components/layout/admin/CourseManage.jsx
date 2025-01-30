import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Pagination from "../../utils/Pagination"

export function CoursesTable({ courses, onToggleList, onDelete, onSort }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [coursesPerPage] = useState(3)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  const handleDeleteClick = (course) => {
    setCourseToDelete(course)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(courseToDelete._id, courseToDelete.tutorId._id)
      setDeleteModalOpen(false)
      setCourseToDelete(null)
      toast.success("Course deleted successfully")
    } catch (error) {
      toast.error("Failed to delete course")
    }
  }

  const paginateData = (data) => {
    const startIndex = currentPage * coursesPerPage - coursesPerPage
    const endIndex = startIndex + coursesPerPage
    return data.slice(startIndex, endIndex)
  }

  const filteredItems = paginateData(courses)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Active Courses</CardTitle>
        <Select onValueChange={onSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground">No courses to show</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                      <span className="font-medium">{course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{course.tutorId.fullName}</TableCell>
                  <TableCell>{course.enrolleeCount}</TableCell>
                  <TableCell>₹{course.price.$numberDecimal}</TableCell>
                  <TableCell>
                    ₹{course.enrolleeCount * course.price.$numberDecimal}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={course.isListed ? "destructive" : "default"}
                      size="sm"
                      className="mr-2"
                      onClick={() => onToggleList(course._id, course.isListed)}
                    >
                      {course.isListed ? "Unlist" : "List"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(course)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 flex justify-center">
          <Pagination
            totalData={courses.length}
            dataPerPage={coursesPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </CardContent>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the course.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

