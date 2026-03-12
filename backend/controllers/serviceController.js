const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all services (public, with filters)
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    const query = {};
    const { keyword, category, listingType, userId } = req.query;

    if (keyword) {
      const searchRegex = { $regex: keyword, $options: 'i' };
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (category) {
      query.category = category;
    }

    if (listingType && ['seller', 'buyer'].includes(listingType)) {
      query.listingType = listingType;
    }

    if (userId) {
      query.user = userId;
    }

    const services = await Service.find(query)
      .populate('user', 'name university image _id email')
      .sort({ createdAt: -1 });

    res.status(200).json(services);
});

// @desc    Get a single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).populate(
      'user',
      'name university image _id email'
    );

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    res.status(200).json(service);
});

// @desc    Create service
// @route   POST /api/services
// @access  Private
const createService = asyncHandler(async (req, res) => {
    const { title, description, category, price, listingType, contactInfo } = req.body;

    if (!title || !description || !category || !price) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    const service = await Service.create({
      user: req.user._id,
      title,
      description,
      category,
      price,
      listingType: listingType === 'buyer' ? 'buyer' : 'seller',
      contactInfo: contactInfo || '',
    });

    const populatedService = await Service.findById(service._id).populate(
      'user',
      'name university image _id email'
    );

    res.status(201).json(populatedService);
});

// @desc    Get my services
// @route   GET /api/services/my-services
// @access  Private
const getMyServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(services);
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (service.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { title, description, category, price, listingType, contactInfo } = req.body;

    service.title = title || service.title;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price || service.price;
    service.listingType = listingType || service.listingType;
    service.contactInfo = contactInfo || service.contactInfo;

    const updatedService = await service.save();

    res.status(200).json(updatedService);
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (service.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    await service.deleteOne();

    res.status(200).json({ message: 'Service removed' });
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  getMyServices,
  updateService,
  deleteService
};