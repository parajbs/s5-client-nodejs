"use strict";

const path = require("path");
const fs = require("fs");
const mime = require("mime/lite");
const urljoin = require("url-join");
const { sign } = require("tweetnacl");

BigInt.prototype.toJSON = function () {
  return this.toString();
};

let fileSizeCounter = 0;
let endProgressCounter = 0;

/**
 * The default URL of the S5 portal to use in the absence of configuration.
 */
const defaultS5PortalUrl = "http://127.0.0.1:5522";

/**
 * The URI prefix for S5-net.
 */
const uriS5Prefix = "s5://";

function defaultOptions(endpointPath) {
  return {
    portalUrl: defaultPortalUrl(),
    endpointPath: endpointPath,

    APIKey: "",
    s5ApiKey: "",
    customUserAgent: "",
    onUploadProgress: undefined,
  };
}

/**
 * Selects the default portal URL to use when initializing a client. May involve network queries to several candidate portals.
 */
function defaultPortalUrl() {
  return defaultS5PortalUrl;
}

/**
 * Extract only the model's custom options from the given options.
 *
 * @param opts - The given options.
 * @param model - The model options.
 * @returns - The extracted custom options.
 * @throws - If the given opts don't contain all properties of the model.
 */
function extractOptions(opts, model) {
  const result = {};
  for (const property in model) {
    if (!Object.prototype.hasOwnProperty.call(model, property)) {
      continue;
    }
    // Throw if the given options don't contain the model's property.
    if (!Object.prototype.hasOwnProperty.call(opts, property)) {
      throw new Error(`Property '${property}' not found`);
    }
    result[property] = opts[property];
  }

  return result;
}

/**
 * Get the file mime type. Try to guess the file type based on the extension.
 *
 * @param filename - The filename.
 * @returns - The mime type.
 */
function getFileMimeType(filename) {
  let ext = path.extname(filename);
  //ext = trimPrefix(ext, ".");
  if (ext !== "") {
    const mimeType = mime.getType(ext);
    if (mimeType) {
      return mimeType;
    }
  }
  return "";
}

/**
 * Properly joins paths together to create a URL. Takes a variable number of
 * arguments.
 */
function makeUrl() {
  let args = Array.from(arguments);
  return args.reduce(function (acc, cur) {
    return urljoin(acc, cur);
  });
}

function walkDirectory(filepath, out) {
  let files = [];
  if (!fs.existsSync(filepath)) {
    return files;
  }

  for (const subpath of fs.readdirSync(filepath)) {
    const fullpath = path.join(filepath, subpath);
    if (fs.statSync(fullpath).isDirectory()) {
      files = files.concat(walkDirectory(fullpath, out));
      continue;
    }
    files.push(fullpath);
  }
  return files;
}

/**
 * Get the publicKey from privateKey.
 *
 * @param privateKey - The privateKey.
 * @returns - The publicKey.
 */
const getPublicKeyFromPrivateKey = function (privateKey) {
  const publicKey = Buffer.from(
    sign.keyPair.fromSecretKey(Uint8Array.from(Buffer.from(privateKey, "hex"))).publicKey
  ).toString("hex");
  return publicKey;
};

/**
 * Formats the S5 cid by adding the s5: prefix.
 *
 * @param cid - The S5 cid.
 * @returns - The formatted S5 cid.
 */
const formatCid = function (cid) {
  if (cid === "") {
    return cid;
  }
  if (!cid.startsWith(uriS5Prefix)) {
    cid = `${uriS5Prefix}${cid}`;
  }
  return cid;
};

module.exports = {
  defaultS5PortalUrl,
  uriS5Prefix,
  defaultOptions,
  defaultPortalUrl,
  extractOptions,
  getFileMimeType,
  makeUrl,
  walkDirectory,
  getPublicKeyFromPrivateKey,
  formatCid,
};
