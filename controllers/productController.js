const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const pageSize = 8; // Số sản phẩm trên mỗi trang
    const page = Number(req.query.page) || 1;
    
    // Xử lý các tham số lọc
    const keyword = req.query.keyword 
      ? { name: { $regex: req.query.keyword, $options: 'i' } } 
      : {};
      
    const category = req.query.category 
      ? { category: req.query.category } 
      : {};
      
    const minPrice = req.query.minPrice 
      ? { price: { $gte: Number(req.query.minPrice) } } 
      : {};
      
    const maxPrice = req.query.maxPrice 
      ? { price: { $lte: Number(req.query.maxPrice) } } 
      : {};
    
    const minRating = req.query.minRating
      ? { rating: { $gte: Number(req.query.minRating) } }
      : {};
    
    // Tạo query với tất cả điều kiện lọc
    const query = {
      ...keyword,
      ...(req.query.category ? category : {}),
      ...(req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {}),
      ...(req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {}),
      ...(req.query.minRating ? { rating: { $gte: Number(req.query.minRating) } } : {})
    };
    
    // Đếm tổng số sản phẩm phù hợp với điều kiện tìm kiếm
    const totalProducts = await Product.countDocuments(query);
    
    // Tính số trang
    const pages = Math.ceil(totalProducts / pageSize);
    
    // Lấy danh sách sản phẩm với phân trang
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    // Trả về kết quả có thêm thông tin phân trang
    res.json({
      products,
      page,
      pages,
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
    } = req.body;

    const product = new Product({
      name,
      price,
      user: req.user._id,
      image,
      brand,
      category,
      countInStock,
      numReviews: 0,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Sản phẩm không tồn tại');
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Tính lại điểm đánh giá trung bình
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Đã thêm đánh giá' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = async (req, res, next) => {
  try {
    // Lấy tất cả các danh mục khác nhau từ các sản phẩm
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  createProductReview,
}; 