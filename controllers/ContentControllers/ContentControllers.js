const { default: mongoose } = require("mongoose");
const {
  sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const Admin = require("../../models/Admin");
const Pages = require("../../models/Pages");
const Sections = require("../../models/Sections");
const SubSections = require("../../models/Subsections");
const Header = require("../../models/header");
const FooterSection = require("../../models/FooterSection");
const cloudinary = require("../../upload/cloudinary");
const fs = require("fs");
const Footer = require("../../models/Footer");
const FooterPage = require("../../models/FooterPage");
// Recursively extract content for a given language
// const extractLangContent = (obj, lang) => {
//     if (obj == null || typeof obj !== 'object') return obj;

//     const keys = Object.keys(obj);
//     const isLocalizedString = keys.includes('en') || keys.includes('de'); // Check for localized fields

//     // If it's a localized field like { en: "...", de: "..." }
//     if (isLocalizedString && obj[lang] !== undefined) {
//         return obj[lang];  // Return the specific language value (e.g., 'en', 'fr', 'de')
//     }

//     // Handle arrays
//     if (Array.isArray(obj)) {
//         return obj.map(item => extractLangContent(item, lang));
//     }

//     // Recurse into nested objects
//     const result = {};
//     for (const key in obj) {
//         result[key] = extractLangContent(obj[key], lang);
//     }
//     return result;
// };

// const getPage = async (req, res) => {
//     try {
//         const { pageID, lang } = req.query;

//         // Validate pageID
//         if (!pageID) {
//             return res.status(400).json({ success: false, message: "pageID is required" });
//         }

//         // Fetch page data from the database
//         const pageData = await Pages.findOne({ _id: pageID }).lean();

//         // Handle case where page is not found
//         if (!pageData) {
//             return res.status(404).json({ success: false, message: "Page not found" });
//         }

//         // If lang is provided, return localized version
//         if (lang) {
//             const localizedPage = {
//                 _id: pageData._id,
//                 path: pageData.path,
//                 name: pageData.name?.[lang] || null, // Extract localized name
//                 meta: {
//                     title: pageData.meta?.title?.[lang] || null,  // Extract localized title
//                     description: pageData.meta?.description?.[lang] || null, // Extract localized description
//                 },
//                 sections: (pageData.sections || [])
//                     .filter(section => !section.disabled) //  Exclude disabled sections
//                     .map(section => ({
//                         _id: section._id,
//                         type: section.type,
//                         content: extractLangContent(section.content, lang),
//                     })),
//                 createdAt: pageData.createdAt,
//                 updatedAt: pageData.updatedAt,
//             };

//             return res.status(200).json({ success: true, data: localizedPage });
//         }

//         // If no lang is provided, return the full multilingual page
//         return res.status(200).json({ success: true, data: pageData });

//     } catch (error) {
//         console.error("Error in getPages:", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// const updatePages = async (req, res) => {
//     try {
//         const { pageID, lang } = req.query; // `lang` and `pageID` are required
//         const { name, meta, sections } = req.body; // Fields to update

//         // Validate pageID and content to be updated
//         if (!pageID) return res.status(400).json({ success: false, message: "pageID is required" });
//         if (!name && !meta && !sections) return res.status(400).json({ success: false, message: "At least one field (name, meta, or sections) must be provided for update" });

//         // Find the page document by ID
//         const pageData = await Pages.findOne({ _id: pageID });

//         if (!pageData) return res.status(404).json({ success: false, message: "Page not found" });

//         // Function to safely update fields for localized strings
//         const updateLocalizedContent = (field, lang, content) => {
//             if (lang && field) {
//                 field[lang] = content;
//             } else if (field) {
//                 // If no specific lang, update all languages
//                 for (const language in field) {
//                     field[language] = content;
//                 }
//             }
//         };

//         // Update the `name` field
//         if (name) {
//             updateLocalizedContent(pageData.name, lang, name);
//         }

//         // Update the `meta` fields (title, description)
//         if (meta) {
//             if (meta.title) {
//                 updateLocalizedContent(pageData.meta.title, lang, meta.title);
//             }
//             if (meta.description) {
//                 updateLocalizedContent(pageData.meta.description, lang, meta.description);
//             }
//         }

//         // Update sections content (for each section)
//         if (sections) {
//             sections.forEach(section => {
//                 const pageSection = pageData.sections.id(section._id);
//                 if (pageSection) {
//                     // Update section's content fields based on lang
//                     if (section.content) {
//                         for (const key in section.content) {
//                             updateLocalizedContent(pageSection.content[key], lang, section.content[key]);
//                         }
//                     }
//                 }
//             });
//         }

//         // Save the updated page document
//         await pageData.save();

//         // Return the updated page
//         return res.status(200).json({ success: true, data: pageData });

//     } catch (error) {
//         console.error("Error updating page:", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

const getPages = async (req, res) => {
  try {
    const { pageID } = req.query;
    if (!pageID) return sendErrorResponse(res, 400, "pageID is required");

    // const pageData = await Pages.findById(pageID).lean();
    // const sections = await Sections.find({ pageId: pageID }).populate("subsections").lean();
    // pageData.sections = sections;

    const agg = [
      { $match: { _id: new mongoose.Types.ObjectId(pageID) } },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "pageId",
          as: "sections",
          pipeline: [
            {
              $lookup: {
                from: "subsections",
                let: { sectionId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$sectionId", "$$sectionId"] },
                    },
                  },
                  {
                    $project: {
                      heading: 1,
                      subHeading: 1,
                      description: 1,
                      subSectionMedia: 1,
                      subSectionBackground: 1,
                      mediaType: 1,
                      ctaButton: 1,
                      ctaLink: 1,
                      order: 1,
                    },
                  },
                  {
                    $sort: {
                      order: 1,
                    },
                  },
                ],
                as: "subsections",
              },
            },
            {
              $project: {
                headline: 1,
                subHeadline: 1,
                description: 1,
                ctaButton: 1,
                ctaLink: 1,
                sectionMedia: 1,
                sectionBackground: 1,
                mediaType: 1,
                subsections: 1,
                published: 1,
                order: 1,
              },
            },
            {
              $sort: {
                order: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          meta: {
            title: 1,
            description: 1,
          },
          seoTitle: 1,
          seoDescription: 1,
          seoKeywords: 1,
          tags: 1,
          ogTitle: 1,
          ogDescription: 1,
          path: 1,
          subSection_video: 1,
          mediaType: 1,
          sections: 1,
        },
      },
    ];

    const pageData = await Pages.aggregate(agg);
    // console.log(pageData);
    if (!pageData || pageData.length === 0) {
      return sendErrorResponse(res, 404, "Page not found");
    }

    return res.status(200).json({ success: true, data: pageData[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getAllPages = async (req, res) => {
  try {
    const allPages = await Pages.find();
    console.log(allPages);
    return res.status(200).json({ success: true, data: allPages });
  } catch (error) {
    return res.status(500).json({ success: true, data: allPages });
  }
};

// const updatePage = async (req, res) => {
//     const {id} = req.query;
//   const {name, path, meta, sections } = req.body;

//   try {
//     const page = await Pages.findById(id);
//     if (!page) return res.status(404).json({ error: "Page not found" });

//     // 1. Update Page
//     page.name = name;
//     page.path = path;
//     if (meta) page.meta = meta;
//     await page.save();

//     // 2. Fetch all existing sections
//     const existingSections = await Sections.find({ pageId: id });
//     const existingSectionIds = existingSections.map(s => s._id.toString());

//     const incomingSectionIds = sections.map(s => s.id).filter(Boolean);
//     const sectionsToRemove = existingSectionIds.filter(id => !incomingSectionIds.includes(id));
//     await Sections.deleteMany({ _id: { $in: sectionsToRemove } });

//     for (const section of sections) {
//       const { id: sectionId, subsections, ...sectionData } = section;

//       let sectionDoc;
//       if (sectionId) {
//         // Update existing section
//         sectionDoc = await Sections.findByIdAndUpdate(sectionId, sectionData, { new: true });
//       }
//     //   else {
//     //     // Create new section
//     //     sectionDoc = await Sections.create({ ...sectionData, pageId: id });
//     //   }

//       // Handle subsections
//       const existingSubsections = await SubSections.find({ sectionId: sectionDoc._id });
//       const existingSubIds = existingSubsections.map(s => s._id.toString());

//       const incomingSubIds = (subsections || []).map(s => s.id).filter(Boolean);
//       const subsToRemove = existingSubIds.filter(id => !incomingSubIds.includes(id));
//       await SubSections.deleteMany({ _id: { $in: subsToRemove } });

//       for (const sub of subsections || []) {
//         const { id: subId, ...subData } = sub;
//         if (subId) {
//           await SubSections.findByIdAndUpdate(subId, subData, { new: true });
//         } else {
//           await SubSections.create({ ...subData, sectionId: sectionDoc._id });
//         }
//       }
//     }

//     res.json({ message: "Page updated successfully" });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ error: "Failed to update page" });
//   }
// };

// const updatePage = async (req,res) => {
//     try {
//         const { sectionId } = req.query;
//         if(!sectionId) return sendErrorResponse(res, 400, "SectionId is required.");
//         const content  = req.body;
//         const pageData = await Pages.findOne({"sections._id": sectionId});
//         if(!pageData) return sendErrorResponse(res, 404, "Section not found.");
//         const section = pageData.sections.id(sectionId);
//         section.content = content
//         await pageData.save();
//         return res.status(200).json({success: true, data: section});
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({success: false, data: "Internal Server Error"});
//     }
// }

const createHeader = async (req, res) => {
  try {
    const {
      title,
      url,
      externalURL = false,
      isCta = false,
      disclaimer,
      order,
      published = true,
    } = req.body;

    if (!title) return sendErrorResponse(res, 400, "title is required");
    if (!url) return sendErrorResponse(res, 400, "url is required");

    if (externalURL === true) {
      const isValid = /^https?:\/\/.+/.test(url);
      if (!isValid)
        return sendErrorResponse(res, 400, "Invalid external URL format");
    }

    const header = await Header.create({
      title,
      url,
      externalURL,
      isCta,
      disclaimer,
      order,
      published,
    });

    return res.status(200).json({ success: true, data: header });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getHeader = async (req, res) => {
  try {
    const agg = [
      {
        $project: {
          _id: 1,
          title: 1,
          url: 1,
          isCta: 1,
          externalURL: 1,
          disclaimer: 1,
          order: 1,
          published: 1,
        },
      },
      { $sort: { order: 1 } },
    ];

    const data = await Header.aggregate(agg);

    const links = data.filter((h) => !h.isCta);
    const ctaButtons = data.filter((h) => h.isCta);

    return res.status(200).json({
      success: true,
      data: {
        links,
        ctaButtons,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getHeaderById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return sendErrorResponse(res, 400, "id is required");

    const agg = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          _id: 1,
          title: 1,
          url: 1,
          isCta: 1,
          externalURL: 1,
          disclaimer: 1,
          order: 1,
          published: 1,
        },
      },
    ];

    const data = await Header.aggregate(agg);
    if (!data[0]) return sendErrorResponse(res, 404, "Header not found");

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: "Internal Server Error",
    });
  }
};

const editHeader = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const { title, url, isCta, externalURL, disclaimer, published, order } =
      req.body;

    let updateData = {};

    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (isCta !== undefined) updateData.isCta = isCta;
    if (externalURL !== undefined) updateData.externalURL = externalURL;
    if (disclaimer !== undefined) updateData.disclaimer = disclaimer;
    if (order !== undefined) updateData.order = order;
    if (published !== undefined) updateData.published = published;

    if (externalURL !== undefined || url !== undefined) {
      const finalExternal = externalURL !== undefined ? externalURL : undefined;
      const finalUrl = url !== undefined ? url : undefined;

      const ext = finalExternal !== undefined ? finalExternal : false;
      const link = finalUrl !== undefined ? finalUrl : undefined;

      if (link !== undefined) {
        if (ext === true) {
          const isValid = /^https?:\/\/.+/.test(link);
          if (!isValid)
            return sendErrorResponse(res, 400, "Invalid external URL format");
        }
      }
    }

    const footerData = await Header.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!footerData) return sendErrorResponse(res, 404, "Header not found");

    return res.status(200).json({ success: true, data: footerData });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: "Internal Server Error",
    });
  }
};

const getFooter = async (req, res) => {
  try {
    const agg = [
      {
        $lookup: {
          from: "footersections",
          localField: "sections",
          foreignField: "_id",
          as: "sections",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          url: 1,
          isCta: 1,
          sections: 1,
        },
      },
    ];

    const data = await Footer.aggregate(agg);

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res
      .status(500)
      .json({ Success: false, data: "Internal Server Error" });
  }
};

const getFooterById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return sendErrorResponse(res, 400, "id is required");
    const agg = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "footersections",
          localField: "sections",
          foreignField: "_id",
          as: "sections",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          url: 1,
          isCta: 1,
          sections: 1,
        },
      },
    ];
    const data = await Footer.aggregate(agg);

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ Success: false, data: "Internal Server Error" });
  }
};

const getFooterByKey = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) return sendErrorResponse(res, 400, "key is required");

    const data = await Footer.find({ key: key });

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res
      .status(500)
      .json({ Success: false, data: "Internal Server Error" });
  }
};

const createFooter = async (req, res) => {
  try {
    const { title, url, sections, key } = req.body;
    if (!title) return sendErrorResponse(res, 400, "title is required");

    const newFooter = await Footer.create({
      title,
      url,
      sections,
      key,
    });
    console.log(newFooter);
    if (!newFooter)
      return res
        .status(400)
        .json({ success: true, data: "An unknown error occurred" });

    return res.status(200).json({ success: true, data: newFooter });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

const editFooter = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const { title, sections, published } = req.body;

    let updateData = {};

    if (title) {
      updateData.title = title;
    }
    if (sections && Array.isArray(sections)) {
      // updateData.sections = sections.map((elem) => {
      //   return {
      //     title: elem.title || "",
      //     url: elem.url || "",
      //     externalURL: !!elem.externalURL,
      //     isCta: !!elem.isCta,
      //     key: elem.title.toLowerCase() || "",
      //     published:
      //       typeof elem.published === "boolean" ? elem.published : true,
      //   };
      // });
      sections.map(async (section) => {
        let { title, url, key, _id } = section;
        await editFooterSection(_id, title, url, key);
      });
    }
    if (published !== undefined) {
      updateData.published = published;
    }

    const footerData = await Footer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!footerData) return sendErrorResponse(res, 400, "Header not found");

    return res.status(200).json({ success: true, data: footerData });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const editFooterSection = async (id, title, url, key) => {
  try {
    if (!id) return false;

    let updateData = {};

    if (title) {
      updateData.title = title;
    }
    // if (isCta) {
    //   updateData.isCta = isCta;
    // }
    if (url) {
      updateData.url = url;
    }

    const footerData = await FooterSection.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    // console.log("Title", title);
    // console.log("url", url);
    // console.log(footerData);
    if (footerData) return true;
  } catch (error) {
    return false;
  }
};

const getFooterSectionById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const agg = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          url: "$url",
          externalURL: "$externalURL",
          isCta: "$isCta",
          disclaimer: 1,
          logo: "$logo",
          copyrightText: 1,
        },
      },
    ];

    const data = await FooterSection.aggregate(agg);
    if (!data) return sendErrorResponse(res, 400, "Error");

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const editFooterSectionById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const { title, isCta, url, key } = req.body;

    let updateData = {};

    if (title) {
      updateData.title = title;
    }
    if (isCta) {
      updateData.isCta = isCta;
    }
    if (url) {
      updateData.url = url;
    }

    const footerData = await FooterSection.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!footerData) return sendErrorResponse(res, 400, "Header not found");

    return res.status(200).json({ success: true, data: footerData });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};
const addFooterToSection = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const { sections } = req.body;

    const footer = await Footer.findById(id);
    if (!footer) {
      return res.status(404).json({ success: false, data: "No Section Found" });
    }

    // Create all sections and wait for them
    const createdSections = await Promise.all(
      sections.map((elem) => FooterSection.create({ ...elem, footerId: id }))
    );

    // Push IDs
    footer.sections.push(...createdSections.map((s) => s._id));

    await footer.save();

    return res.status(200).json({ success: true, data: footer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getFooterPage = async (req, res) => {
  try {
    const { slug, lang } = req.query;

    let footerPage;
    if (slug) {
      footerPage = await FooterPage.findOne({
        slug: slug,
        language: lang ? lang : "en",
      });
      if (!footerPage)
        return sendErrorResponse(res, 404, "Footer page not found");

      return res.status(200).json({ success: true, data: footerPage });
    }

    footerPage = await FooterPage.find({ lang });
    if (!footerPage) return sendErrorResponse(res, 404, "No Footer page found");

    return res.status(200).json({ success: true, data: footerPage });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const editFooterPage = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "Page not found");

    const footerPage = await FooterPage.findById(id);
    if (!footerPage)
      return sendErrorResponse(res, 404, "Footer page not found");

    const { heading, subHeading, content, language } = req.body;

    if (heading) footerPage.heading = heading;
    if (subHeading) footerPage.subHeading = subHeading;
    if (content) footerPage.content = content;
    if (language) footerPage.language = language;

    if (req.file) {
      if (footerPage.public_id) {
        await cloudinary.uploader.destroy(footerPage.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `footerpage/${heading || footerPage.heading}`,
      });

      footerPage.media = result.secure_url;
      footerPage.public_id = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    await footerPage.save();

    return res.status(200).json({ success: true, data: footerPage });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

module.exports = {
  getPages,
  getAllPages,
  createHeader,
  getHeader,
  getHeaderById,
  editHeader,
  getFooter,
  getFooterById,
  editFooter,
  getFooterSectionById,
  editFooterSectionById,
  createFooter,
  getFooterByKey,
  editFooterPage,
  getFooterPage,
  addFooterToSection,
};
