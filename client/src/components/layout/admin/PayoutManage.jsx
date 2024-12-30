import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PayoutRequests({ requests = [], onApprove, onReject }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [action, setAction] = useState(null);

  

  const handleAction = async () => {
    try {
      if (action === 'approve') {
        await onApprove(selectedRequest._id,action)
        toast.success("Payout request approved")
      } else {
        await onReject(selectedRequest._id,action)
        toast.success("Payout request rejected")
      }
      setActionDialogOpen(false)
    } catch (error) {
      toast.error("Failed to process request")
    }
  }

  const openActionDialog = (request, actionType) => {
    setSelectedRequest(request)
    setAction(actionType)
    setActionDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <img crossOrigin="anonymous" referrerPolicy="no-referrer" src={request.tutorId?.profileImg} />
                      <AvatarFallback>{request.tutorId?.fullName}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.tutorId?.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.tutorId?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>₹{request.amount}</TableCell>
                <TableCell>
                  {request.paymentDetails.paymentMethod==='upi'?
                  <div className="text-sm">
                  <div>Upi ID: {request.paymentDetails?.upiId}</div>
                  
                </div> :  <div className="text-sm">
                    <div>Account No: {request.paymentDetails?.accountNumber}</div>
                    <div>IFSC Code: {request.paymentDetails?.ifscCode}</div>
                  </div>
                }
                 
                </TableCell>
                <TableCell>
                <Badge
  className={
    {
      pending: 'bg-yellow-200 text-black',
      approved: 'bg-green-200 text-black',
      rejected: 'bg-red-200 text-black',
    }[request.status] || 'bg-gray-200 text-black'
  }
>
  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
</Badge>


                </TableCell>
                <TableCell>
                  {new Date(request.requestedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="mr-2"
                        onClick={() => openActionDialog(request, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openActionDialog(request, 'reject')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {action} this payout request?
              {action === 'approve' && (
                <div className="mt-2 font-medium">
                  Amount: ₹{selectedRequest?.amount}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

