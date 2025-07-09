import { RequestHandler } from 'express';
import { orderService } from './order.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllOrder: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrder(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getOrderById: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.getOrderById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order retrieved successfully',
    data: result
  });
});

const createOrder: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Order created successfully',
    data: result
  });
});

const updateOrder: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.updateOrder(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order updated successfully',
    data: result
  });
});

const deleteOrder: RequestHandler = catchAsync(async (req, res) => {
  await orderService.deleteOrder(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order deleted successfully',
    data: null
  });
});

const updateOrderStatus: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.updateOrderStatus(req.params.id, req.body.status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order status updated successfully',
    data: result
  });
});

const trackOrder: RequestHandler = catchAsync(async (req, res) => {
  const result = await orderService.orderTracker(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order tracked successfully',
    data: result
  });
});

export const getInvoice: RequestHandler = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const pdfBuffer = await orderService.generateInvoicePDF(orderId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
  res.send(pdfBuffer);
});

export const orderController = {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  trackOrder,
  getInvoice
};
