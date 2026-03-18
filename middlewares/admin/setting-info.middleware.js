
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
module.exports = async (req, res, next) => {
    try {
        const websiteInfo = await SettingWebsiteInfo.findOne({});
        res.locals.websiteInfo = websiteInfo; 
        next();
    } catch (err) {
        next(err);
    }
};