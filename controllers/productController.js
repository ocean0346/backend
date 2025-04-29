const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    console.log('Server: Yêu cầu tìm kiếm sản phẩm với query:', req.query);
    
    const pageSize = 8; // Số sản phẩm trên mỗi trang
    const page = Number(req.query.page) || 1;
    
    // Bắt đầu với một đối tượng query trống
    let query = {};
    
    // Thêm tìm kiếm theo từ khóa nếu có
    if (req.query.keyword) {
      try {
        // Decode URL encoded keywords
        const decodedKeyword = decodeURIComponent(req.query.keyword);
        console.log('Server: Tìm kiếm với từ khóa gốc:', decodedKeyword);
        
        // Làm sạch từ khóa, loại bỏ các ký tự đặc biệt của regex và escape các ký tự đặc biệt khác
        const sanitizedKeyword = decodedKeyword
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape các ký tự đặc biệt của regex
          .trim();
        
        console.log('Server: Từ khóa sau khi làm sạch:', sanitizedKeyword);
        
        // Tìm kiếm trong cả tên và mô tả sản phẩm
        // Sử dụng $or để tìm kiếm trong nhiều trường
        query = {
          $or: [
            { name: { $regex: sanitizedKeyword, $options: 'i' } },
            { description: { $regex: sanitizedKeyword, $options: 'i' } }
          ]
        };
        
        console.log('Server: Query tìm kiếm $or:', JSON.stringify(query));
      } catch (error) {
        console.error('Server: Lỗi khi xử lý từ khóa tìm kiếm:', error);
        // Fallback đến tìm kiếm cơ bản nếu có lỗi
        query.name = { $regex: req.query.keyword, $options: 'i' };
      }
    }
    
    // Thêm tìm kiếm theo danh mục nếu có
    if (req.query.category) {
      console.log('Server: Lọc theo danh mục:', req.query.category);
      // Nếu đã có từ khóa tìm kiếm, thêm điều kiện danh mục vào query
      if (query.$or) {
        // Thêm điều kiện AND với danh mục
        query = {
          $and: [
            query, // giữ lại điều kiện $or cho từ khóa
            { category: req.query.category }
          ]
        };
      } else {
        // Nếu chưa có từ khóa, chỉ cần thêm trực tiếp
        query.category = req.query.category;
      }
    }
    
    // Xử lý lọc theo giá (kết hợp min và max price nếu cả hai đều có)
    if (req.query.minPrice || req.query.maxPrice) {
      // Nếu đã có điều kiện $and, thêm vào mảng
      if (query.$and) {
        const priceFilter = {};
        
        if (req.query.minPrice) {
          priceFilter.$gte = Number(req.query.minPrice);
          console.log('Server: Lọc giá tối thiểu:', req.query.minPrice);
        }
        
        if (req.query.maxPrice) {
          priceFilter.$lte = Number(req.query.maxPrice);
          console.log('Server: Lọc giá tối đa:', req.query.maxPrice);
        }
        
        query.$and.push({ price: priceFilter });
      }
      // Nếu đã có điều kiện $or nhưng chưa có $and
      else if (query.$or) {
        const priceFilter = {};
        
        if (req.query.minPrice) {
          priceFilter.$gte = Number(req.query.minPrice);
          console.log('Server: Lọc giá tối thiểu:', req.query.minPrice);
        }
        
        if (req.query.maxPrice) {
          priceFilter.$lte = Number(req.query.maxPrice);
          console.log('Server: Lọc giá tối đa:', req.query.maxPrice);
        }
        
        query = {
          $and: [
            query, // giữ lại điều kiện $or cho từ khóa
            { price: priceFilter }
          ]
        };
      }
      // Nếu chưa có cả $or và $and
      else {
        query.price = {};
        
        if (req.query.minPrice) {
          query.price.$gte = Number(req.query.minPrice);
          console.log('Server: Lọc giá tối thiểu:', req.query.minPrice);
        }
        
        if (req.query.maxPrice) {
          query.price.$lte = Number(req.query.maxPrice);
          console.log('Server: Lọc giá tối đa:', req.query.maxPrice);
        }
      }
    }
    
    // Thêm lọc theo đánh giá nếu có
    if (req.query.minRating) {
      console.log('Server: Lọc theo đánh giá tối thiểu:', req.query.minRating);
      
      // Tương tự như với giá, xử lý theo cấu trúc query hiện tại
      if (query.$and) {
        query.$and.push({ rating: { $gte: Number(req.query.minRating) } });
      } else if (query.$or) {
        query = {
          $and: [
            query,
            { rating: { $gte: Number(req.query.minRating) } }
          ]
        };
      } else {
        query.rating = { $gte: Number(req.query.minRating) };
      }
    }
    
    console.log('Server: Query MongoDB cuối cùng:', JSON.stringify(query));
    
    // Đếm tổng số sản phẩm phù hợp với điều kiện tìm kiếm
    const totalProducts = await Product.countDocuments(query);
    console.log('Server: Tổng số sản phẩm phù hợp:', totalProducts);
    
    // Tính số trang
    const pages = Math.ceil(totalProducts / pageSize);
    
    // Lấy danh sách sản phẩm với phân trang
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    console.log('Server: Trả về', products.length, 'sản phẩm cho trang', page, '/', pages);
    console.log('Server: Tên các sản phẩm trả về:', products.map(p => p.name).join(', '));
    
    // Trả về kết quả có thêm thông tin phân trang
    res.json({
      products,
      page,
      pages,
      totalProducts
    });
  } catch (error) {
    console.error('Server: Lỗi khi tìm kiếm sản phẩm:', error);
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