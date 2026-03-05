const Service = require('../models/Service');

const normalizeListingType = (value) => (value === 'buyer' ? 'buyer' : 'seller');

const serviceUserFields = 'name university course email image whatsappNumber marketMode';

const getServices = async (req, res) => {
  try {
    const query = {};
    const keyword = String(req.query.keyword ?? '').trim();
    const category = String(req.query.category ?? '').trim();
    const listingType = String(req.query.listingType ?? '').trim();

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (listingType === 'buyer' || listingType === 'seller') query.listingType = listingType;

    const services = await Service.find(query)
      .populate('user', serviceUserFields)
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createService = async (req, res) => {
  const { title, description, category, price, contactInfo, listingType } = req.body;

  try {
    const cleanTitle = String(title ?? '').trim();
    const cleanDescription = String(description ?? '').trim();
    const cleanCategory = String(category ?? '').trim();
    const cleanContact = String(contactInfo ?? '').trim();
    const priceNumber = Number(price);

    if (
      !cleanTitle ||
      !cleanDescription ||
      !cleanCategory ||
      !cleanContact ||
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0
    ) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const service = new Service({
      user: req.user._id,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      listingType: normalizeListingType(listingType ?? req.user.marketMode),
      price: priceNumber,
      contactInfo: cleanContact,
    });
    const createdService = await service.save();
    const hydrated = await createdService.populate('user', serviceUserFields);
    res.status(201).json(hydrated);
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid service data' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ user: req.user._id })
      .populate('user', serviceUserFields)
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('user', serviceUserFields);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const nextTitle = String(req.body?.title ?? service.title).trim();
    const nextDescription = String(req.body?.description ?? service.description).trim();
    const nextCategory = String(req.body?.category ?? service.category).trim();
    const nextContact = String(req.body?.contactInfo ?? service.contactInfo).trim();
    const nextPrice = Number(req.body?.price ?? service.price);
    const nextListingType = normalizeListingType(req.body?.listingType ?? service.listingType);

    if (
      !nextTitle ||
      !nextDescription ||
      !nextCategory ||
      !nextContact ||
      !Number.isFinite(nextPrice) ||
      nextPrice <= 0
    ) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    service.title = nextTitle;
    service.description = nextDescription;
    service.category = nextCategory;
    service.contactInfo = nextContact;
    service.price = nextPrice;
    service.listingType = nextListingType;

    const updated = await service.save();
    const hydrated = await updated.populate('user', serviceUserFields);
    return res.json(hydrated);
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid service data' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getServices,
  createService,
  getMyServices,
  deleteService,
  getServiceById,
  updateService,
};
