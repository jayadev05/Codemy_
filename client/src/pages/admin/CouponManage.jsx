'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertCircle, Bell } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import axiosInstance from '@/config/axiosConfig'
import Sidebar from '@/components/layout/admin/sidebar'
import { useSelector } from 'react-redux'
import { selectAdmin } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'

export default function CouponManagement() {

const admin= useSelector(selectAdmin);
  const [coupons, setCoupons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    usageLimit: '',
    validTill: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get('/admin/get-coupons')
      
      setCoupons(response.data.coupons);

    } catch (err) {
      setError('Failed to fetch coupons');
      console.log("Failed to fetch coupon",error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {

      const response= await axiosInstance.post('/admin/create-coupon',formData);

      console.log("response status",response.status);
      
      if(response.status===200){
        await fetchCoupons()
        setIsDialogOpen(false)
        resetForm()
      }
     
    } catch (err) {
        console.log(error);
      toast.error("Failed to create coupon")
    }
  }

  const toggleCouponStatus = async (couponId) => {
    try {
    
        const response = await axiosInstance.put(`/admin/toggle-coupon-status/${couponId}`);

         await fetchCoupons()

    } catch (err) {
        console.log(err);
      toast.error("Failed to update coupon status")
    }
  }

  const deleteCoupon = async (couponId) => {
    try {
      
        const response= await axiosInstance.delete(`/admin/delete-coupon/${couponId}`);

       await fetchCoupons()

    } catch (err) {
        console.log(err);
      toast.error("Failed to delete coupon!");
    }
  }

  const onLogout=()=>{
    try {
      const response=axiosInstance.post("http://localhost:3000/admin/logout");

      dispatch(logoutAdmin(admin));

      toast.success("Logged out successfully");
      
      navigate('/login');

      
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user")
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      usageLimit: '',
      validTill: '',
      isActive: true
    })
  }

  return (
    <>
    <div className='flex'>
    <Sidebar activeSection="Coupons"/>
    <div className='flex-1 flex-col flex'>

    {/* header */}
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative group">
              <img
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                src={admin?.profileImg || '/placeholder.svg'}
                alt=""
              />
              <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {admin?.userName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {admin?.email}
                  </p>
                </div>
                <a
                  
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </a>
                <a
                 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

    <div className="container px-10 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and manage discount coupons</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='bg-[#eb5a0c] hover:bg-orange-700'>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Add a new coupon code with specific discount rules.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'Percentage' ? "10" : "100"}
                    required

                    min="0"
                    max={formData.discountType === 'Percentage' ? "100" : "999999"}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="validTill">Valid Till</Label>
                  <Input
                    id="validTill"
                    type="datetime-local"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Create Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Till</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No coupons found</TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === 'Percentage' 
                      ? `${coupon.discountValue}%` 
                      : `$${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {coupon.usageLimit 
                      ? `${coupon.usedCount}/${coupon.usageLimit}` 
                      : `${coupon.usedCount}/∞`}
                  </TableCell>
                  <TableCell>
                    {format(new Date(coupon.validTill), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className={`text-sm ${
                        coupon.isActive 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCoupon(coupon._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    </div>
   
    </div>
    
    </>
    
  )
}
