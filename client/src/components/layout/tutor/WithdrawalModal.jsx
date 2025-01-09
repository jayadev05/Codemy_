"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { BanknoteIcon, QrCode } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/config/axiosConfig"
import { useDispatch } from "react-redux"
import { addTutor } from "@/store/slices/tutorSlice"

export function WithdrawDialog({ open, onOpenChange, availableBalance, tutorId }) {
  // Form state
  const [formData, setFormData] = useState({
    paymentMethod: "bank",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    amount: ""
  })


  const dispatch=useDispatch();


  // Error state
  const [errors, setErrors] = useState({})
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Handle payment method change
  const handlePaymentMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value,
      // Clear fields of other payment method
      accountHolder: value === "bank" ? prev.accountHolder : "",
      accountNumber: value === "bank" ? prev.accountNumber : "",
      ifsc: value === "bank" ? prev.ifsc : "",
      upiId: value === "upi" ? prev.upiId : ""
    }))
    // Clear related errors
    setErrors({})
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else {
      const amountNum = parseFloat(formData.amount)
      if (isNaN(amountNum)) {
        newErrors.amount = "Please enter a valid amount"
      } else if (amountNum < 500) {
        newErrors.amount = "Minimum withdrawal amount is ₹500"
      } else if (amountNum > availableBalance) {
        newErrors.amount = "Amount cannot exceed available balance"
      } else if (amountNum % 1 !== 0) {
        newErrors.amount = "Amount must be a whole number"
      }
    }

    if (formData.paymentMethod === "bank") {
      // Bank transfer validation
      if (!formData.accountHolder) {
        newErrors.accountHolder = "Account holder name is required"
      } else if (!/^[a-zA-Z ]+$/.test(formData.accountHolder)) {
        newErrors.accountHolder = "Please enter a valid name"
      }

      if (!formData.accountNumber) {
        newErrors.accountNumber = "Account number is required"
      } else if (!/^\d+$/.test(formData.accountNumber)) {
        newErrors.accountNumber = "Please enter a valid account number"
      } else if (formData.accountNumber.length < 8) {
        newErrors.accountNumber = "Account number must be at least 8 digits"
      }

      if (!formData.ifsc) {
        newErrors.ifsc = "IFSC code is required"
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
        newErrors.ifsc = "Please enter a valid IFSC code"
      }
    } else {
      // UPI validation
      if (!formData.upiId) {
        newErrors.upiId = "UPI ID is required"
      } else if (!/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/.test(formData.upiId)) {
        newErrors.upiId = "Please enter a valid UPI ID"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      paymentMethod: "bank",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      upiId: "",
      amount: ""
    })
    setErrors({})
  }

  // Handle dialog close
  const handleDialogClose = (open) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      
      const paymentDetails = formData.paymentMethod === "upi" 
        ? { 
            upiId: formData.upiId ,
            paymentMethod:formData.paymentMethod
          }
        : {
            accountHolder: formData.accountHolder,
            accountNumber: formData.accountNumber,
            ifsc: formData.ifsc,
            paymentMethod:formData.paymentMethod
          }

      const response = await axiosInstance.post('/tutor/payouts/requests', {
        amount: parseFloat(formData.amount),
        tutorId,
        paymentDetails
      });


      toast.success("Withdrawal request submitted successfully")
      resetForm()
      onOpenChange(false)

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit withdrawal request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Withdraw Funds</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Available balance: ₹{availableBalance.toLocaleString()}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={handlePaymentMethodChange}
              className="grid grid-cols-2 gap-4"
            >
              <Label htmlFor="bank" className="cursor-pointer">
                <Card className={`${
                  formData.paymentMethod === "bank" ? "border-2 border-orange-500" : ""
                } hover:border-orange-500`}>
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <RadioGroupItem value="bank" id="bank" className="sr-only" />
                    <BanknoteIcon className={`h-6 w-6 ${
                      formData.paymentMethod === "bank" ? "text-orange-500" : "text-gray-500"
                    }`} />
                    <span className="text-sm font-medium">Bank Transfer</span>
                  </CardContent>
                </Card>
              </Label>

              <Label htmlFor="upi" className="cursor-pointer">
                <Card className={`${
                  formData.paymentMethod === "upi" ? "border-2 border-orange-500" : ""
                } hover:border-orange-500`}>
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <RadioGroupItem value="upi" id="upi" className="sr-only" />
                    <QrCode className={`h-6 w-6 ${
                      formData.paymentMethod === "upi" ? "text-orange-500" : "text-gray-500"
                    }`} />
                    <span className="text-sm font-medium">UPI</span>
                  </CardContent>
                </Card>
              </Label>
            </RadioGroup>
          </div>

          {formData.paymentMethod === "bank" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {errors.accountHolder && (
                  <p className="text-sm text-red-500 mt-1">{errors.accountHolder}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.accountNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input
                  id="ifsc"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="BANK0123456"
                />
                {errors.ifsc && (
                  <p className="text-sm text-red-500 mt-1">{errors.ifsc}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="example@upi"
              />
              {errors.upiId && (
                <p className="text-sm text-red-500 mt-1">{errors.upiId}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="amount">Amount in Rs :</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}