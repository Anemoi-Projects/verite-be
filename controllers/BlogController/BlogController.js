const { default: mongoose } = require("mongoose");
const {
    sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const Blogs = require("../../models/Blogs");
const cloudinary = require('../../upload/cloudinary');
const Admin = require("../../models/Admin");


const createBlog = async (req, res) => {
    try {
        const { 
            heading,
            description,
            slug,
        } = req.body;
        const { lang } = req.query;
        if (!lang) return sendErrorResponse(res, 400, "lang is required")
        if (!slug) return sendErrorResponse(res, 400, "Slug is required");
        const existing = await Blogs.findOne({ slug });
        if (existing) return sendErrorResponse(res, 400, "Duplicate slug found");

        const author = await Admin.findById(req.user.id);

        let categories = [];
        if (req.body.tags) {
            try {
                const parsed = JSON.parse(req.body.tags);

                parsed.forEach(tagID => {
                    categories.push(tagID);
                });

            } catch (err) {
                console.log(err)
                return res.status(400).json({ error: 'Invalid categories JSON' });
            }
        }

        await Blogs.create({
            heading: heading,
            description: description,
            slug: slug,
            language: lang || "en",
            status: "draft",
            authorName: author.fullName
        });

        return res.status(200).json({ success: true, data: "Blog Saved as Draft" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};


const getAllBlogs = async (req, res) => {
    const { lang } = req.query;
    if (!lang) return sendErrorResponse(res, 400, "lang is required");
    try {
        const agg = [
            {
                $match: {
                    language: lang
                }
            },
            {
                $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                    from: "categories",
                    localField: "tags",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    heading: 1,
                    slug: 1,
                    description: 1,
                    thumbnail: 1,
                    tags: 1,
                    authorName: 1,
                    authorBio: 1,
                    authorImage: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    seoKeywords: 1,
                    ogTitle: 1,
                    ogDescription: 1,
                    status: 1,
                    categories: "$categories.name",
                    language: 1,
                    createdAt: 1
                }
            },
            {
                $sort:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    createdAt: -1
                }
            },
        ]
        const blogs = await Blogs.aggregate(agg);
        return res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

const getAllPublishedBlogs = async (req, res) => {
    try {
        const {lang} = req.query;
        if (!lang) return sendErrorResponse(res, 400, "lang is required");
        const agg = [
            {
                $match: {
                    status: "published",
                    language: lang
                }
            },
            {
                $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                    from: "categories",
                    localField: "tags",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    heading: 1,
                    slug: 1,
                    description: 1,
                    thumbnail: 1,
                    tags: 1,
                    authorName: 1,
                    authorBio: 1,
                    authorImage: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    seoKeywords: 1,
                    ogTitle: 1,
                    ogDescription: 1,
                    status: 1,
                    categories: "$categories.name",
                    language: 1,
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]
        const blogs = await Blogs.aggregate(agg);
        return res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

const getBlog = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");
        const agg = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }

            },
            {
                $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                    from: "categories",
                    localField: "tags",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    heading: 1,
                    slug: 1,
                    description: 1,
                    thumbnail: 1,
                    tags: 1,
                    authorName: 1,
                    authorBio: 1,
                    authorImage: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    seoKeywords: 1,
                    ogTitle: 1,
                    ogDescription: 1,
                    status: 1,
                    language: 1,
                    content: 1,
                    categories: "$categories.name"
                }
            }
        ]
        const blogs = await Blogs.aggregate(agg);
        if (!blogs) return sendErrorResponse(res, 404, "Blog not found");

        return res.status(200).json({ success: true, data: blogs[0] });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};

const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.query;
        if (!slug) return sendErrorResponse(res, 400, "slug is required");
        const agg = [
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                    from: "categories",
                    localField: "tags",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    heading: 1,
                    slug: 1,
                    description: 1,
                    thumbnail: 1,
                    tags: 1,
                    authorName: 1,
                    authorBio: 1,
                    authorImage: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    seoKeywords: 1,
                    ogTitle: 1,
                    ogDescription: 1,
                    status: 1,
                    content: 1,
                    categories: "$categories.name"
                }
            }
        ]
        const blogs = await Blogs.aggregate(agg);
        if (!blogs) return sendErrorResponse(res, 404, `Blog with slug ${slug} not found`);
        return res.status(200).json({ success: true, data: blogs[0] });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, data: "Internal Server Error" })
    }
}

const editBlog = async (req, res) => {
    try {
        const { id } = req.query;
        const { content,
            heading,
            description,
            slug,
            status,
            seoTitle,
            tags,
            seoDescription,
            seoKeywords,
            ogTitle,
            ogDescription,
            authorName,
            authorBio,
        } = req.body;


        if (!id) return sendErrorResponse(res, 400, "id is required");

        const blog = await Blogs.findById(id);
        if (!blog) return sendErrorResponse(res, 404, "Blog not found");


        if (req.files?.thumbnail?.[0]) {
            const result = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
                folder: `blogs/thumbnails/${blog._id}`,
            });
            blog.thumbnail = result.secure_url;
        } else if (req.body.thumbnail === "null") {
            blog.thumbnail = null;
        }

        if (req.files?.authorImage?.[0]) {
            const result = await cloudinary.uploader.upload(req.files.authorImage[0].path, {
                folder: `blogs/authorImages/${blog._id}`,
            });
            blog.authorImage = result.secure_url;
        } else if (req.body.authorImage === "null") {
            blog.authorImage = null;
        }

        let categories = [];
        if (tags) {
            try {
                const parsed = JSON.parse(tags);

                parsed.forEach(tagID => {
                    categories.push(tagID);
                });

            } catch (err) {
                console.log(err)
                return res.status(400).json({ error: 'Invalid categories JSON' });
            }
        }


        if (content) blog.content = content;
        if (heading) blog.heading = heading;
        if (description) blog.description = description;
        if (slug) blog.slug = slug;
        if (tags) blog.tags = categories;
        if (status) blog.status = status;
        if (seoTitle) blog.seoTitle = seoTitle;
        if (seoDescription) blog.seoDescription = seoDescription;
        if (seoKeywords) blog.seoKeywords = JSON.parse(seoKeywords);
        if (ogTitle) blog.ogTitle = ogTitle;
        if (ogDescription) blog.ogDescription = ogDescription;
        if (authorName) blog.authorName = authorName;
        if (authorBio) blog.authorBio = authorBio;


        await blog.save();

        return res.status(200).json({ success: true, data: blog });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");

        await Blogs.findByIdAndDelete(id)

        return res.status(200).json({ success: true, data: `Blog ${id} deleted successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}


module.exports = { createBlog, getBlog, editBlog, getAllBlogs, deleteBlog, getAllPublishedBlogs, getBlogBySlug }