define( function( require, exports, module ) {

	var Inflate = require( './Inflater' );
	var Deflate = require( './Deflater' );
	var async = require( 'ndi.async' );

	/*
 Copyright (c) 2012 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

	var zip = {
		Inflater : Inflate,
		Deflater : Deflate
	};

	var table = {
		"application" : {
			"andrew-inset" : "ez",
			"annodex" : "anx",
			"atom+xml" : "atom",
			"atomcat+xml" : "atomcat",
			"atomserv+xml" : "atomsrv",
			"bbolin" : "lin",
			"cap" : [ "cap", "pcap" ],
			"cu-seeme" : "cu",
			"davmount+xml" : "davmount",
			"dsptype" : "tsp",
			"ecmascript" : [ "es", "ecma" ],
			"futuresplash" : "spl",
			"hta" : "hta",
			"java-archive" : "jar",
			"java-serialized-object" : "ser",
			"java-vm" : "class",
			"javascript" : "js",
			"m3g" : "m3g",
			"mac-binhex40" : "hqx",
			"mathematica" : [ "nb", "ma", "mb" ],
			"msaccess" : "mdb",
			"msword" : [ "doc", "dot" ],
			"mxf" : "mxf",
			"oda" : "oda",
			"ogg" : "ogx",
			"pdf" : "pdf",
			"pgp-keys" : "key",
			"pgp-signature" : [ "asc", "sig" ],
			"pics-rules" : "prf",
			"postscript" : [ "ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3" ],
			"rar" : "rar",
			"rdf+xml" : "rdf",
			"rss+xml" : "rss",
			"rtf" : "rtf",
			"smil" : [ "smi", "smil" ],
			"xhtml+xml" : [ "xhtml", "xht" ],
			"xml" : [ "xml", "xsl", "xsd" ],
			"xspf+xml" : "xspf",
			"zip" : "zip",
			"vnd.android.package-archive" : "apk",
			"vnd.cinderella" : "cdy",
			"vnd.google-earth.kml+xml" : "kml",
			"vnd.google-earth.kmz" : "kmz",
			"vnd.mozilla.xul+xml" : "xul",
			"vnd.ms-excel" : [ "xls", "xlb", "xlt", "xlm", "xla", "xlc", "xlw" ],
			"vnd.ms-pki.seccat" : "cat",
			"vnd.ms-pki.stl" : "stl",
			"vnd.ms-powerpoint" : [ "ppt", "pps", "pot" ],
			"vnd.oasis.opendocument.chart" : "odc",
			"vnd.oasis.opendocument.database" : "odb",
			"vnd.oasis.opendocument.formula" : "odf",
			"vnd.oasis.opendocument.graphics" : "odg",
			"vnd.oasis.opendocument.graphics-template" : "otg",
			"vnd.oasis.opendocument.image" : "odi",
			"vnd.oasis.opendocument.presentation" : "odp",
			"vnd.oasis.opendocument.presentation-template" : "otp",
			"vnd.oasis.opendocument.spreadsheet" : "ods",
			"vnd.oasis.opendocument.spreadsheet-template" : "ots",
			"vnd.oasis.opendocument.text" : "odt",
			"vnd.oasis.opendocument.text-master" : "odm",
			"vnd.oasis.opendocument.text-template" : "ott",
			"vnd.oasis.opendocument.text-web" : "oth",
			"vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "xlsx",
			"vnd.openxmlformats-officedocument.spreadsheetml.template" : "xltx",
			"vnd.openxmlformats-officedocument.presentationml.presentation" : "pptx",
			"vnd.openxmlformats-officedocument.presentationml.slideshow" : "ppsx",
			"vnd.openxmlformats-officedocument.presentationml.template" : "potx",
			"vnd.openxmlformats-officedocument.wordprocessingml.document" : "docx",
			"vnd.openxmlformats-officedocument.wordprocessingml.template" : "dotx",
			"vnd.smaf" : "mmf",
			"vnd.stardivision.calc" : "sdc",
			"vnd.stardivision.chart" : "sds",
			"vnd.stardivision.draw" : "sda",
			"vnd.stardivision.impress" : "sdd",
			"vnd.stardivision.math" : [ "sdf", "smf" ],
			"vnd.stardivision.writer" : [ "sdw", "vor" ],
			"vnd.stardivision.writer-global" : "sgl",
			"vnd.sun.xml.calc" : "sxc",
			"vnd.sun.xml.calc.template" : "stc",
			"vnd.sun.xml.draw" : "sxd",
			"vnd.sun.xml.draw.template" : "std",
			"vnd.sun.xml.impress" : "sxi",
			"vnd.sun.xml.impress.template" : "sti",
			"vnd.sun.xml.math" : "sxm",
			"vnd.sun.xml.writer" : "sxw",
			"vnd.sun.xml.writer.global" : "sxg",
			"vnd.sun.xml.writer.template" : "stw",
			"vnd.symbian.install" : [ "sis", "sisx" ],
			"vnd.visio" : [ "vsd", "vst", "vss", "vsw" ],
			"vnd.wap.wbxml" : "wbxml",
			"vnd.wap.wmlc" : "wmlc",
			"vnd.wap.wmlscriptc" : "wmlsc",
			"vnd.wordperfect" : "wpd",
			"vnd.wordperfect5.1" : "wp5",
			"x-123" : "wk",
			"x-7z-compressed" : "7z",
			"x-abiword" : "abw",
			"x-apple-diskimage" : "dmg",
			"x-bcpio" : "bcpio",
			"x-bittorrent" : "torrent",
			"x-cbr" : [ "cbr", "cba", "cbt", "cb7" ],
			"x-cbz" : "cbz",
			"x-cdf" : [ "cdf", "cda" ],
			"x-cdlink" : "vcd",
			"x-chess-pgn" : "pgn",
			"x-cpio" : "cpio",
			"x-csh" : "csh",
			"x-debian-package" : [ "deb", "udeb" ],
			"x-director" : [ "dcr", "dir", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa" ],
			"x-dms" : "dms",
			"x-doom" : "wad",
			"x-dvi" : "dvi",
			"x-httpd-eruby" : "rhtml",
			"x-font" : "pcf.Z",
			"x-freemind" : "mm",
			"x-gnumeric" : "gnumeric",
			"x-go-sgf" : "sgf",
			"x-graphing-calculator" : "gcf",
			"x-gtar" : [ "gtar", "taz" ],
			"x-hdf" : "hdf",
			"x-httpd-php" : [ "phtml", "pht", "php" ],
			"x-httpd-php-source" : "phps",
			"x-httpd-php3" : "php3",
			"x-httpd-php3-preprocessed" : "php3p",
			"x-httpd-php4" : "php4",
			"x-httpd-php5" : "php5",
			"x-ica" : "ica",
			"x-info" : "info",
			"x-internet-signup" : [ "ins", "isp" ],
			"x-iphone" : "iii",
			"x-iso9660-image" : "iso",
			"x-java-jnlp-file" : "jnlp",
			"x-jmol" : "jmz",
			"x-killustrator" : "kil",
			"x-koan" : [ "skp", "skd", "skt", "skm" ],
			"x-kpresenter" : [ "kpr", "kpt" ],
			"x-kword" : [ "kwd", "kwt" ],
			"x-latex" : "latex",
			"x-lha" : "lha",
			"x-lyx" : "lyx",
			"x-lzh" : "lzh",
			"x-lzx" : "lzx",
			"x-maker" : [ "frm", "maker", "frame", "fm", "fb", "book", "fbdoc" ],
			"x-ms-wmd" : "wmd",
			"x-ms-wmz" : "wmz",
			"x-msdos-program" : [ "com", "exe", "bat", "dll" ],
			"x-msi" : "msi",
			"x-netcdf" : [ "nc", "cdf" ],
			"x-ns-proxy-autoconfig" : [ "pac", "dat" ],
			"x-nwc" : "nwc",
			"x-object" : "o",
			"x-oz-application" : "oza",
			"x-pkcs7-certreqresp" : "p7r",
			"x-python-code" : [ "pyc", "pyo" ],
			"x-qgis" : [ "qgs", "shp", "shx" ],
			"x-quicktimeplayer" : "qtl",
			"x-redhat-package-manager" : "rpm",
			"x-ruby" : "rb",
			"x-sh" : "sh",
			"x-shar" : "shar",
			"x-shockwave-flash" : [ "swf", "swfl" ],
			"x-silverlight" : "scr",
			"x-stuffit" : "sit",
			"x-sv4cpio" : "sv4cpio",
			"x-sv4crc" : "sv4crc",
			"x-tar" : "tar",
			"x-tcl" : "tcl",
			"x-tex-gf" : "gf",
			"x-tex-pk" : "pk",
			"x-texinfo" : [ "texinfo", "texi" ],
			"x-trash" : [ "~", "%", "bak", "old", "sik" ],
			"x-troff" : [ "t", "tr", "roff" ],
			"x-troff-man" : "man",
			"x-troff-me" : "me",
			"x-troff-ms" : "ms",
			"x-ustar" : "ustar",
			"x-wais-source" : "src",
			"x-wingz" : "wz",
			"x-x509-ca-cert" : [ "crt", "der", "cer" ],
			"x-xcf" : "xcf",
			"x-xfig" : "fig",
			"x-xpinstall" : "xpi",
			"applixware" : "aw",
			"atomsvc+xml" : "atomsvc",
			"ccxml+xml" : "ccxml",
			"cdmi-capability" : "cdmia",
			"cdmi-container" : "cdmic",
			"cdmi-domain" : "cdmid",
			"cdmi-object" : "cdmio",
			"cdmi-queue" : "cdmiq",
			"docbook+xml" : "dbk",
			"dssc+der" : "dssc",
			"dssc+xml" : "xdssc",
			"emma+xml" : "emma",
			"epub+zip" : "epub",
			"exi" : "exi",
			"font-tdpfr" : "pfr",
			"gml+xml" : "gml",
			"gpx+xml" : "gpx",
			"gxf" : "gxf",
			"hyperstudio" : "stk",
			"inkml+xml" : [ "ink", "inkml" ],
			"ipfix" : "ipfix",
			"json" : "json",
			"jsonml+json" : "jsonml",
			"lost+xml" : "lostxml",
			"mads+xml" : "mads",
			"marc" : "mrc",
			"marcxml+xml" : "mrcx",
			"mathml+xml" : "mathml",
			"mbox" : "mbox",
			"mediaservercontrol+xml" : "mscml",
			"metalink+xml" : "metalink",
			"metalink4+xml" : "meta4",
			"mets+xml" : "mets",
			"mods+xml" : "mods",
			"mp21" : [ "m21", "mp21" ],
			"mp4" : "mp4s",
			"oebps-package+xml" : "opf",
			"omdoc+xml" : "omdoc",
			"onenote" : [ "onetoc", "onetoc2", "onetmp", "onepkg" ],
			"oxps" : "oxps",
			"patch-ops-error+xml" : "xer",
			"pgp-encrypted" : "pgp",
			"pkcs10" : "p10",
			"pkcs7-mime" : [ "p7m", "p7c" ],
			"pkcs7-signature" : "p7s",
			"pkcs8" : "p8",
			"pkix-attr-cert" : "ac",
			"pkix-crl" : "crl",
			"pkix-pkipath" : "pkipath",
			"pkixcmp" : "pki",
			"pls+xml" : "pls",
			"prs.cww" : "cww",
			"pskc+xml" : "pskcxml",
			"reginfo+xml" : "rif",
			"relax-ng-compact-syntax" : "rnc",
			"resource-lists+xml" : "rl",
			"resource-lists-diff+xml" : "rld",
			"rls-services+xml" : "rs",
			"rpki-ghostbusters" : "gbr",
			"rpki-manifest" : "mft",
			"rpki-roa" : "roa",
			"rsd+xml" : "rsd",
			"sbml+xml" : "sbml",
			"scvp-cv-request" : "scq",
			"scvp-cv-response" : "scs",
			"scvp-vp-request" : "spq",
			"scvp-vp-response" : "spp",
			"sdp" : "sdp",
			"set-payment-initiation" : "setpay",
			"set-registration-initiation" : "setreg",
			"shf+xml" : "shf",
			"sparql-query" : "rq",
			"sparql-results+xml" : "srx",
			"srgs" : "gram",
			"srgs+xml" : "grxml",
			"sru+xml" : "sru",
			"ssdl+xml" : "ssdl",
			"ssml+xml" : "ssml",
			"tei+xml" : [ "tei", "teicorpus" ],
			"thraud+xml" : "tfi",
			"timestamped-data" : "tsd",
			"vnd.3gpp.pic-bw-large" : "plb",
			"vnd.3gpp.pic-bw-small" : "psb",
			"vnd.3gpp.pic-bw-var" : "pvb",
			"vnd.3gpp2.tcap" : "tcap",
			"vnd.3m.post-it-notes" : "pwn",
			"vnd.accpac.simply.aso" : "aso",
			"vnd.accpac.simply.imp" : "imp",
			"vnd.acucobol" : "acu",
			"vnd.acucorp" : [ "atc", "acutc" ],
			"vnd.adobe.air-application-installer-package+zip" : "air",
			"vnd.adobe.formscentral.fcdt" : "fcdt",
			"vnd.adobe.fxp" : [ "fxp", "fxpl" ],
			"vnd.adobe.xdp+xml" : "xdp",
			"vnd.adobe.xfdf" : "xfdf",
			"vnd.ahead.space" : "ahead",
			"vnd.airzip.filesecure.azf" : "azf",
			"vnd.airzip.filesecure.azs" : "azs",
			"vnd.amazon.ebook" : "azw",
			"vnd.americandynamics.acc" : "acc",
			"vnd.amiga.ami" : "ami",
			"vnd.anser-web-certificate-issue-initiation" : "cii",
			"vnd.anser-web-funds-transfer-initiation" : "fti",
			"vnd.antix.game-component" : "atx",
			"vnd.apple.installer+xml" : "mpkg",
			"vnd.apple.mpegurl" : "m3u8",
			"vnd.aristanetworks.swi" : "swi",
			"vnd.astraea-software.iota" : "iota",
			"vnd.audiograph" : "aep",
			"vnd.blueice.multipass" : "mpm",
			"vnd.bmi" : "bmi",
			"vnd.businessobjects" : "rep",
			"vnd.chemdraw+xml" : "cdxml",
			"vnd.chipnuts.karaoke-mmd" : "mmd",
			"vnd.claymore" : "cla",
			"vnd.cloanto.rp9" : "rp9",
			"vnd.clonk.c4group" : [ "c4g", "c4d", "c4f", "c4p", "c4u" ],
			"vnd.cluetrust.cartomobile-config" : "c11amc",
			"vnd.cluetrust.cartomobile-config-pkg" : "c11amz",
			"vnd.commonspace" : "csp",
			"vnd.contact.cmsg" : "cdbcmsg",
			"vnd.cosmocaller" : "cmc",
			"vnd.crick.clicker" : "clkx",
			"vnd.crick.clicker.keyboard" : "clkk",
			"vnd.crick.clicker.palette" : "clkp",
			"vnd.crick.clicker.template" : "clkt",
			"vnd.crick.clicker.wordbank" : "clkw",
			"vnd.criticaltools.wbs+xml" : "wbs",
			"vnd.ctc-posml" : "pml",
			"vnd.cups-ppd" : "ppd",
			"vnd.curl.car" : "car",
			"vnd.curl.pcurl" : "pcurl",
			"vnd.dart" : "dart",
			"vnd.data-vision.rdz" : "rdz",
			"vnd.dece.data" : [ "uvf", "uvvf", "uvd", "uvvd" ],
			"vnd.dece.ttml+xml" : [ "uvt", "uvvt" ],
			"vnd.dece.unspecified" : [ "uvx", "uvvx" ],
			"vnd.dece.zip" : [ "uvz", "uvvz" ],
			"vnd.denovo.fcselayout-link" : "fe_launch",
			"vnd.dna" : "dna",
			"vnd.dolby.mlp" : "mlp",
			"vnd.dpgraph" : "dpg",
			"vnd.dreamfactory" : "dfac",
			"vnd.ds-keypoint" : "kpxx",
			"vnd.dvb.ait" : "ait",
			"vnd.dvb.service" : "svc",
			"vnd.dynageo" : "geo",
			"vnd.ecowin.chart" : "mag",
			"vnd.enliven" : "nml",
			"vnd.epson.esf" : "esf",
			"vnd.epson.msf" : "msf",
			"vnd.epson.quickanime" : "qam",
			"vnd.epson.salt" : "slt",
			"vnd.epson.ssf" : "ssf",
			"vnd.eszigno3+xml" : [ "es3", "et3" ],
			"vnd.ezpix-album" : "ez2",
			"vnd.ezpix-package" : "ez3",
			"vnd.fdf" : "fdf",
			"vnd.fdsn.mseed" : "mseed",
			"vnd.fdsn.seed" : [ "seed", "dataless" ],
			"vnd.flographit" : "gph",
			"vnd.fluxtime.clip" : "ftc",
			"vnd.framemaker" : [ "fm", "frame", "maker", "book" ],
			"vnd.frogans.fnc" : "fnc",
			"vnd.frogans.ltf" : "ltf",
			"vnd.fsc.weblaunch" : "fsc",
			"vnd.fujitsu.oasys" : "oas",
			"vnd.fujitsu.oasys2" : "oa2",
			"vnd.fujitsu.oasys3" : "oa3",
			"vnd.fujitsu.oasysgp" : "fg5",
			"vnd.fujitsu.oasysprs" : "bh2",
			"vnd.fujixerox.ddd" : "ddd",
			"vnd.fujixerox.docuworks" : "xdw",
			"vnd.fujixerox.docuworks.binder" : "xbd",
			"vnd.fuzzysheet" : "fzs",
			"vnd.genomatix.tuxedo" : "txd",
			"vnd.geogebra.file" : "ggb",
			"vnd.geogebra.tool" : "ggt",
			"vnd.geometry-explorer" : [ "gex", "gre" ],
			"vnd.geonext" : "gxt",
			"vnd.geoplan" : "g2w",
			"vnd.geospace" : "g3w",
			"vnd.gmx" : "gmx",
			"vnd.grafeq" : [ "gqf", "gqs" ],
			"vnd.groove-account" : "gac",
			"vnd.groove-help" : "ghf",
			"vnd.groove-identity-message" : "gim",
			"vnd.groove-injector" : "grv",
			"vnd.groove-tool-message" : "gtm",
			"vnd.groove-tool-template" : "tpl",
			"vnd.groove-vcard" : "vcg",
			"vnd.hal+xml" : "hal",
			"vnd.handheld-entertainment+xml" : "zmm",
			"vnd.hbci" : "hbci",
			"vnd.hhe.lesson-player" : "les",
			"vnd.hp-hpgl" : "hpgl",
			"vnd.hp-hpid" : "hpid",
			"vnd.hp-hps" : "hps",
			"vnd.hp-jlyt" : "jlt",
			"vnd.hp-pcl" : "pcl",
			"vnd.hp-pclxl" : "pclxl",
			"vnd.hydrostatix.sof-data" : "sfd-hdstx",
			"vnd.ibm.minipay" : "mpy",
			"vnd.ibm.modcap" : [ "afp", "listafp", "list3820" ],
			"vnd.ibm.rights-management" : "irm",
			"vnd.ibm.secure-container" : "sc",
			"vnd.iccprofile" : [ "icc", "icm" ],
			"vnd.igloader" : "igl",
			"vnd.immervision-ivp" : "ivp",
			"vnd.immervision-ivu" : "ivu",
			"vnd.insors.igm" : "igm",
			"vnd.intercon.formnet" : [ "xpw", "xpx" ],
			"vnd.intergeo" : "i2g",
			"vnd.intu.qbo" : "qbo",
			"vnd.intu.qfx" : "qfx",
			"vnd.ipunplugged.rcprofile" : "rcprofile",
			"vnd.irepository.package+xml" : "irp",
			"vnd.is-xpr" : "xpr",
			"vnd.isac.fcs" : "fcs",
			"vnd.jam" : "jam",
			"vnd.jcp.javame.midlet-rms" : "rms",
			"vnd.jisp" : "jisp",
			"vnd.joost.joda-archive" : "joda",
			"vnd.kahootz" : [ "ktz", "ktr" ],
			"vnd.kde.karbon" : "karbon",
			"vnd.kde.kchart" : "chrt",
			"vnd.kde.kformula" : "kfo",
			"vnd.kde.kivio" : "flw",
			"vnd.kde.kontour" : "kon",
			"vnd.kde.kpresenter" : [ "kpr", "kpt" ],
			"vnd.kde.kspread" : "ksp",
			"vnd.kde.kword" : [ "kwd", "kwt" ],
			"vnd.kenameaapp" : "htke",
			"vnd.kidspiration" : "kia",
			"vnd.kinar" : [ "kne", "knp" ],
			"vnd.koan" : [ "skp", "skd", "skt", "skm" ],
			"vnd.kodak-descriptor" : "sse",
			"vnd.las.las+xml" : "lasxml",
			"vnd.llamagraphics.life-balance.desktop" : "lbd",
			"vnd.llamagraphics.life-balance.exchange+xml" : "lbe",
			"vnd.lotus-1-2-3" : "123",
			"vnd.lotus-approach" : "apr",
			"vnd.lotus-freelance" : "pre",
			"vnd.lotus-notes" : "nsf",
			"vnd.lotus-organizer" : "org",
			"vnd.lotus-screencam" : "scm",
			"vnd.lotus-wordpro" : "lwp",
			"vnd.macports.portpkg" : "portpkg",
			"vnd.mcd" : "mcd",
			"vnd.medcalcdata" : "mc1",
			"vnd.mediastation.cdkey" : "cdkey",
			"vnd.mfer" : "mwf",
			"vnd.mfmp" : "mfm",
			"vnd.micrografx.flo" : "flo",
			"vnd.micrografx.igx" : "igx",
			"vnd.mif" : "mif",
			"vnd.mobius.daf" : "daf",
			"vnd.mobius.dis" : "dis",
			"vnd.mobius.mbk" : "mbk",
			"vnd.mobius.mqy" : "mqy",
			"vnd.mobius.msl" : "msl",
			"vnd.mobius.plc" : "plc",
			"vnd.mobius.txf" : "txf",
			"vnd.mophun.application" : "mpn",
			"vnd.mophun.certificate" : "mpc",
			"vnd.ms-artgalry" : "cil",
			"vnd.ms-cab-compressed" : "cab",
			"vnd.ms-excel.addin.macroenabled.12" : "xlam",
			"vnd.ms-excel.sheet.binary.macroenabled.12" : "xlsb",
			"vnd.ms-excel.sheet.macroenabled.12" : "xlsm",
			"vnd.ms-excel.template.macroenabled.12" : "xltm",
			"vnd.ms-fontobject" : "eot",
			"vnd.ms-htmlhelp" : "chm",
			"vnd.ms-ims" : "ims",
			"vnd.ms-lrm" : "lrm",
			"vnd.ms-officetheme" : "thmx",
			"vnd.ms-powerpoint.addin.macroenabled.12" : "ppam",
			"vnd.ms-powerpoint.presentation.macroenabled.12" : "pptm",
			"vnd.ms-powerpoint.slide.macroenabled.12" : "sldm",
			"vnd.ms-powerpoint.slideshow.macroenabled.12" : "ppsm",
			"vnd.ms-powerpoint.template.macroenabled.12" : "potm",
			"vnd.ms-project" : [ "mpp", "mpt" ],
			"vnd.ms-word.document.macroenabled.12" : "docm",
			"vnd.ms-word.template.macroenabled.12" : "dotm",
			"vnd.ms-works" : [ "wps", "wks", "wcm", "wdb" ],
			"vnd.ms-wpl" : "wpl",
			"vnd.ms-xpsdocument" : "xps",
			"vnd.mseq" : "mseq",
			"vnd.musician" : "mus",
			"vnd.muvee.style" : "msty",
			"vnd.mynfc" : "taglet",
			"vnd.neurolanguage.nlu" : "nlu",
			"vnd.nitf" : [ "ntf", "nitf" ],
			"vnd.noblenet-directory" : "nnd",
			"vnd.noblenet-sealer" : "nns",
			"vnd.noblenet-web" : "nnw",
			"vnd.nokia.n-gage.data" : "ngdat",
			"vnd.nokia.n-gage.symbian.install" : "n-gage",
			"vnd.nokia.radio-preset" : "rpst",
			"vnd.nokia.radio-presets" : "rpss",
			"vnd.novadigm.edm" : "edm",
			"vnd.novadigm.edx" : "edx",
			"vnd.novadigm.ext" : "ext",
			"vnd.oasis.opendocument.chart-template" : "otc",
			"vnd.oasis.opendocument.formula-template" : "odft",
			"vnd.oasis.opendocument.image-template" : "oti",
			"vnd.olpc-sugar" : "xo",
			"vnd.oma.dd2+xml" : "dd2",
			"vnd.openofficeorg.extension" : "oxt",
			"vnd.openxmlformats-officedocument.presentationml.slide" : "sldx",
			"vnd.osgeo.mapguide.package" : "mgp",
			"vnd.osgi.dp" : "dp",
			"vnd.osgi.subsystem" : "esa",
			"vnd.palm" : [ "pdb", "pqa", "oprc" ],
			"vnd.pawaafile" : "paw",
			"vnd.pg.format" : "str",
			"vnd.pg.osasli" : "ei6",
			"vnd.picsel" : "efif",
			"vnd.pmi.widget" : "wg",
			"vnd.pocketlearn" : "plf",
			"vnd.powerbuilder6" : "pbd",
			"vnd.previewsystems.box" : "box",
			"vnd.proteus.magazine" : "mgz",
			"vnd.publishare-delta-tree" : "qps",
			"vnd.pvi.ptid1" : "ptid",
			"vnd.quark.quarkxpress" : [ "qxd", "qxt", "qwd", "qwt", "qxl", "qxb" ],
			"vnd.realvnc.bed" : "bed",
			"vnd.recordare.musicxml" : "mxl",
			"vnd.recordare.musicxml+xml" : "musicxml",
			"vnd.rig.cryptonote" : "cryptonote",
			"vnd.rn-realmedia" : "rm",
			"vnd.rn-realmedia-vbr" : "rmvb",
			"vnd.route66.link66+xml" : "link66",
			"vnd.sailingtracker.track" : "st",
			"vnd.seemail" : "see",
			"vnd.sema" : "sema",
			"vnd.semd" : "semd",
			"vnd.semf" : "semf",
			"vnd.shana.informed.formdata" : "ifm",
			"vnd.shana.informed.formtemplate" : "itp",
			"vnd.shana.informed.interchange" : "iif",
			"vnd.shana.informed.package" : "ipk",
			"vnd.simtech-mindmapper" : [ "twd", "twds" ],
			"vnd.smart.teacher" : "teacher",
			"vnd.solent.sdkm+xml" : [ "sdkm", "sdkd" ],
			"vnd.spotfire.dxp" : "dxp",
			"vnd.spotfire.sfs" : "sfs",
			"vnd.stepmania.package" : "smzip",
			"vnd.stepmania.stepchart" : "sm",
			"vnd.sus-calendar" : [ "sus", "susp" ],
			"vnd.svd" : "svd",
			"vnd.syncml+xml" : "xsm",
			"vnd.syncml.dm+wbxml" : "bdm",
			"vnd.syncml.dm+xml" : "xdm",
			"vnd.tao.intent-module-archive" : "tao",
			"vnd.tcpdump.pcap" : [ "pcap", "cap", "dmp" ],
			"vnd.tmobile-livetv" : "tmo",
			"vnd.trid.tpt" : "tpt",
			"vnd.triscape.mxs" : "mxs",
			"vnd.trueapp" : "tra",
			"vnd.ufdl" : [ "ufd", "ufdl" ],
			"vnd.uiq.theme" : "utz",
			"vnd.umajin" : "umj",
			"vnd.unity" : "unityweb",
			"vnd.uoml+xml" : "uoml",
			"vnd.vcx" : "vcx",
			"vnd.visionary" : "vis",
			"vnd.vsf" : "vsf",
			"vnd.webturbo" : "wtb",
			"vnd.wolfram.player" : "nbp",
			"vnd.wqd" : "wqd",
			"vnd.wt.stf" : "stf",
			"vnd.xara" : "xar",
			"vnd.xfdl" : "xfdl",
			"vnd.yamaha.hv-dic" : "hvd",
			"vnd.yamaha.hv-script" : "hvs",
			"vnd.yamaha.hv-voice" : "hvp",
			"vnd.yamaha.openscoreformat" : "osf",
			"vnd.yamaha.openscoreformat.osfpvg+xml" : "osfpvg",
			"vnd.yamaha.smaf-audio" : "saf",
			"vnd.yamaha.smaf-phrase" : "spf",
			"vnd.yellowriver-custom-menu" : "cmp",
			"vnd.zul" : [ "zir", "zirz" ],
			"vnd.zzazz.deck+xml" : "zaz",
			"voicexml+xml" : "vxml",
			"widget" : "wgt",
			"winhlp" : "hlp",
			"wsdl+xml" : "wsdl",
			"wspolicy+xml" : "wspolicy",
			"x-ace-compressed" : "ace",
			"x-authorware-bin" : [ "aab", "x32", "u32", "vox" ],
			"x-authorware-map" : "aam",
			"x-authorware-seg" : "aas",
			"x-blorb" : [ "blb", "blorb" ],
			"x-bzip" : "bz",
			"x-bzip2" : [ "bz2", "boz" ],
			"x-cfs-compressed" : "cfs",
			"x-chat" : "chat",
			"x-conference" : "nsc",
			"x-dgc-compressed" : "dgc",
			"x-dtbncx+xml" : "ncx",
			"x-dtbook+xml" : "dtb",
			"x-dtbresource+xml" : "res",
			"x-eva" : "eva",
			"x-font-bdf" : "bdf",
			"x-font-ghostscript" : "gsf",
			"x-font-linux-psf" : "psf",
			"x-font-otf" : "otf",
			"x-font-pcf" : "pcf",
			"x-font-snf" : "snf",
			"x-font-ttf" : [ "ttf", "ttc" ],
			"x-font-type1" : [ "pfa", "pfb", "pfm", "afm" ],
			"x-font-woff" : "woff",
			"x-freearc" : "arc",
			"x-gca-compressed" : "gca",
			"x-glulx" : "ulx",
			"x-gramps-xml" : "gramps",
			"x-install-instructions" : "install",
			"x-lzh-compressed" : [ "lzh", "lha" ],
			"x-mie" : "mie",
			"x-mobipocket-ebook" : [ "prc", "mobi" ],
			"x-ms-application" : "application",
			"x-ms-shortcut" : "lnk",
			"x-ms-xbap" : "xbap",
			"x-msbinder" : "obd",
			"x-mscardfile" : "crd",
			"x-msclip" : "clp",
			"x-msdownload" : [ "exe", "dll", "com", "bat", "msi" ],
			"x-msmediaview" : [ "mvb", "m13", "m14" ],
			"x-msmetafile" : [ "wmf", "wmz", "emf", "emz" ],
			"x-msmoney" : "mny",
			"x-mspublisher" : "pub",
			"x-msschedule" : "scd",
			"x-msterminal" : "trm",
			"x-mswrite" : "wri",
			"x-nzb" : "nzb",
			"x-pkcs12" : [ "p12", "pfx" ],
			"x-pkcs7-certificates" : [ "p7b", "spc" ],
			"x-research-info-systems" : "ris",
			"x-silverlight-app" : "xap",
			"x-sql" : "sql",
			"x-stuffitx" : "sitx",
			"x-subrip" : "srt",
			"x-t3vm-image" : "t3",
			"x-tads" : "gam",
			"x-tex" : "tex",
			"x-tex-tfm" : "tfm",
			"x-tgif" : "obj",
			"x-xliff+xml" : "xlf",
			"x-xz" : "xz",
			"x-zmachine" : [ "z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8" ],
			"xaml+xml" : "xaml",
			"xcap-diff+xml" : "xdf",
			"xenc+xml" : "xenc",
			"xml-dtd" : "dtd",
			"xop+xml" : "xop",
			"xproc+xml" : "xpl",
			"xslt+xml" : "xslt",
			"xv+xml" : [ "mxml", "xhvml", "xvml", "xvm" ],
			"yang" : "yang",
			"yin+xml" : "yin",
			"envoy" : "evy",
			"fractals" : "fif",
			"internet-property-stream" : "acx",
			"olescript" : "axs",
			"vnd.ms-outlook" : "msg",
			"vnd.ms-pkicertstore" : "sst",
			"x-compress" : "z",
			"x-compressed" : "tgz",
			"x-gzip" : "gz",
			"x-perfmon" : [ "pma", "pmc", "pml", "pmr", "pmw" ],
			"x-pkcs7-mime" : [ "p7c", "p7m" ],
			"ynd.ms-pkipko" : "pko"
		},
		"audio" : {
			"amr" : "amr",
			"amr-wb" : "awb",
			"annodex" : "axa",
			"basic" : [ "au", "snd" ],
			"flac" : "flac",
			"midi" : [ "mid", "midi", "kar", "rmi" ],
			"mpeg" : [ "mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a" ],
			"mpegurl" : "m3u",
			"ogg" : [ "oga", "ogg", "spx" ],
			"prs.sid" : "sid",
			"x-aiff" : [ "aif", "aiff", "aifc" ],
			"x-gsm" : "gsm",
			"x-ms-wma" : "wma",
			"x-ms-wax" : "wax",
			"x-pn-realaudio" : "ram",
			"x-realaudio" : "ra",
			"x-sd2" : "sd2",
			"x-wav" : "wav",
			"adpcm" : "adp",
			"mp4" : "mp4a",
			"s3m" : "s3m",
			"silk" : "sil",
			"vnd.dece.audio" : [ "uva", "uvva" ],
			"vnd.digital-winds" : "eol",
			"vnd.dra" : "dra",
			"vnd.dts" : "dts",
			"vnd.dts.hd" : "dtshd",
			"vnd.lucent.voice" : "lvp",
			"vnd.ms-playready.media.pya" : "pya",
			"vnd.nuera.ecelp4800" : "ecelp4800",
			"vnd.nuera.ecelp7470" : "ecelp7470",
			"vnd.nuera.ecelp9600" : "ecelp9600",
			"vnd.rip" : "rip",
			"webm" : "weba",
			"x-aac" : "aac",
			"x-caf" : "caf",
			"x-matroska" : "mka",
			"x-pn-realaudio-plugin" : "rmp",
			"xm" : "xm",
			"mid" : [ "mid", "rmi" ]
		},
		"chemical" : {
			"x-alchemy" : "alc",
			"x-cache" : [ "cac", "cache" ],
			"x-cache-csf" : "csf",
			"x-cactvs-binary" : [ "cbin", "cascii", "ctab" ],
			"x-cdx" : "cdx",
			"x-chem3d" : "c3d",
			"x-cif" : "cif",
			"x-cmdf" : "cmdf",
			"x-cml" : "cml",
			"x-compass" : "cpa",
			"x-crossfire" : "bsd",
			"x-csml" : [ "csml", "csm" ],
			"x-ctx" : "ctx",
			"x-cxf" : [ "cxf", "cef" ],
			"x-embl-dl-nucleotide" : [ "emb", "embl" ],
			"x-gamess-input" : [ "inp", "gam", "gamin" ],
			"x-gaussian-checkpoint" : [ "fch", "fchk" ],
			"x-gaussian-cube" : "cub",
			"x-gaussian-input" : [ "gau", "gjc", "gjf" ],
			"x-gaussian-log" : "gal",
			"x-gcg8-sequence" : "gcg",
			"x-genbank" : "gen",
			"x-hin" : "hin",
			"x-isostar" : [ "istr", "ist" ],
			"x-jcamp-dx" : [ "jdx", "dx" ],
			"x-kinemage" : "kin",
			"x-macmolecule" : "mcm",
			"x-macromodel-input" : [ "mmd", "mmod" ],
			"x-mdl-molfile" : "mol",
			"x-mdl-rdfile" : "rd",
			"x-mdl-rxnfile" : "rxn",
			"x-mdl-sdfile" : [ "sd", "sdf" ],
			"x-mdl-tgf" : "tgf",
			"x-mmcif" : "mcif",
			"x-mol2" : "mol2",
			"x-molconn-Z" : "b",
			"x-mopac-graph" : "gpt",
			"x-mopac-input" : [ "mop", "mopcrt", "mpc", "zmt" ],
			"x-mopac-out" : "moo",
			"x-ncbi-asn1" : "asn",
			"x-ncbi-asn1-ascii" : [ "prt", "ent" ],
			"x-ncbi-asn1-binary" : [ "val", "aso" ],
			"x-pdb" : [ "pdb", "ent" ],
			"x-rosdal" : "ros",
			"x-swissprot" : "sw",
			"x-vamas-iso14976" : "vms",
			"x-vmd" : "vmd",
			"x-xtel" : "xtel",
			"x-xyz" : "xyz"
		},
		"image" : {
			"gif" : "gif",
			"ief" : "ief",
			"jpeg" : [ "jpeg", "jpg", "jpe" ],
			"pcx" : "pcx",
			"png" : "png",
			"svg+xml" : [ "svg", "svgz" ],
			"tiff" : [ "tiff", "tif" ],
			"vnd.djvu" : [ "djvu", "djv" ],
			"vnd.wap.wbmp" : "wbmp",
			"x-canon-cr2" : "cr2",
			"x-canon-crw" : "crw",
			"x-cmu-raster" : "ras",
			"x-coreldraw" : "cdr",
			"x-coreldrawpattern" : "pat",
			"x-coreldrawtemplate" : "cdt",
			"x-corelphotopaint" : "cpt",
			"x-epson-erf" : "erf",
			"x-icon" : "ico",
			"x-jg" : "art",
			"x-jng" : "jng",
			"x-nikon-nef" : "nef",
			"x-olympus-orf" : "orf",
			"x-photoshop" : "psd",
			"x-portable-anymap" : "pnm",
			"x-portable-bitmap" : "pbm",
			"x-portable-graymap" : "pgm",
			"x-portable-pixmap" : "ppm",
			"x-rgb" : "rgb",
			"x-xbitmap" : "xbm",
			"x-xpixmap" : "xpm",
			"x-xwindowdump" : "xwd",
			"bmp" : "bmp",
			"cgm" : "cgm",
			"g3fax" : "g3",
			"ktx" : "ktx",
			"prs.btif" : "btif",
			"sgi" : "sgi",
			"vnd.dece.graphic" : [ "uvi", "uvvi", "uvg", "uvvg" ],
			"vnd.dwg" : "dwg",
			"vnd.dxf" : "dxf",
			"vnd.fastbidsheet" : "fbs",
			"vnd.fpx" : "fpx",
			"vnd.fst" : "fst",
			"vnd.fujixerox.edmics-mmr" : "mmr",
			"vnd.fujixerox.edmics-rlc" : "rlc",
			"vnd.ms-modi" : "mdi",
			"vnd.ms-photo" : "wdp",
			"vnd.net-fpx" : "npx",
			"vnd.xiff" : "xif",
			"webp" : "webp",
			"x-3ds" : "3ds",
			"x-cmx" : "cmx",
			"x-freehand" : [ "fh", "fhc", "fh4", "fh5", "fh7" ],
			"x-pict" : [ "pic", "pct" ],
			"x-tga" : "tga",
			"cis-cod" : "cod",
			"pipeg" : "jfif"
		},
		"message" : {
			"rfc822" : [ "eml", "mime", "mht", "mhtml", "nws" ]
		},
		"model" : {
			"iges" : [ "igs", "iges" ],
			"mesh" : [ "msh", "mesh", "silo" ],
			"vrml" : [ "wrl", "vrml" ],
			"x3d+vrml" : [ "x3dv", "x3dvz" ],
			"x3d+xml" : [ "x3d", "x3dz" ],
			"x3d+binary" : [ "x3db", "x3dbz" ],
			"vnd.collada+xml" : "dae",
			"vnd.dwf" : "dwf",
			"vnd.gdl" : "gdl",
			"vnd.gtw" : "gtw",
			"vnd.mts" : "mts",
			"vnd.vtu" : "vtu"
		},
		"text" : {
			"cache-manifest" : [ "manifest", "appcache" ],
			"calendar" : [ "ics", "icz", "ifb" ],
			"css" : "css",
			"csv" : "csv",
			"h323" : "323",
			"html" : [ "html", "htm", "shtml", "stm" ],
			"iuls" : "uls",
			"mathml" : "mml",
			"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
			"richtext" : "rtx",
			"scriptlet" : [ "sct", "wsc" ],
			"texmacs" : [ "tm", "ts" ],
			"tab-separated-values" : "tsv",
			"vnd.sun.j2me.app-descriptor" : "jad",
			"vnd.wap.wml" : "wml",
			"vnd.wap.wmlscript" : "wmls",
			"x-bibtex" : "bib",
			"x-boo" : "boo",
			"x-c++hdr" : [ "h++", "hpp", "hxx", "hh" ],
			"x-c++src" : [ "c++", "cpp", "cxx", "cc" ],
			"x-component" : "htc",
			"x-dsrc" : "d",
			"x-diff" : [ "diff", "patch" ],
			"x-haskell" : "hs",
			"x-java" : "java",
			"x-literate-haskell" : "lhs",
			"x-moc" : "moc",
			"x-pascal" : [ "p", "pas" ],
			"x-pcs-gcd" : "gcd",
			"x-perl" : [ "pl", "pm" ],
			"x-python" : "py",
			"x-scala" : "scala",
			"x-setext" : "etx",
			"x-tcl" : [ "tcl", "tk" ],
			"x-tex" : [ "tex", "ltx", "sty", "cls" ],
			"x-vcalendar" : "vcs",
			"x-vcard" : "vcf",
			"n3" : "n3",
			"prs.lines.tag" : "dsc",
			"sgml" : [ "sgml", "sgm" ],
			"troff" : [ "t", "tr", "roff", "man", "me", "ms" ],
			"turtle" : "ttl",
			"uri-list" : [ "uri", "uris", "urls" ],
			"vcard" : "vcard",
			"vnd.curl" : "curl",
			"vnd.curl.dcurl" : "dcurl",
			"vnd.curl.scurl" : "scurl",
			"vnd.curl.mcurl" : "mcurl",
			"vnd.dvb.subtitle" : "sub",
			"vnd.fly" : "fly",
			"vnd.fmi.flexstor" : "flx",
			"vnd.graphviz" : "gv",
			"vnd.in3d.3dml" : "3dml",
			"vnd.in3d.spot" : "spot",
			"x-asm" : [ "s", "asm" ],
			"x-c" : [ "c", "cc", "cxx", "cpp", "h", "hh", "dic" ],
			"x-fortran" : [ "f", "for", "f77", "f90" ],
			"x-opml" : "opml",
			"x-nfo" : "nfo",
			"x-sfv" : "sfv",
			"x-uuencode" : "uu",
			"webviewhtml" : "htt"
		},
		"video" : {
			"3gpp" : "3gp",
			"annodex" : "axv",
			"dl" : "dl",
			"dv" : [ "dif", "dv" ],
			"fli" : "fli",
			"gl" : "gl",
			"mpeg" : [ "mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2" ],
			"mp4" : [ "mp4", "mp4v", "mpg4" ],
			"quicktime" : [ "qt", "mov" ],
			"ogg" : "ogv",
			"vnd.mpegurl" : [ "mxu", "m4u" ],
			"x-flv" : "flv",
			"x-la-asf" : [ "lsf", "lsx" ],
			"x-mng" : "mng",
			"x-ms-asf" : [ "asf", "asx", "asr" ],
			"x-ms-wm" : "wm",
			"x-ms-wmv" : "wmv",
			"x-ms-wmx" : "wmx",
			"x-ms-wvx" : "wvx",
			"x-msvideo" : "avi",
			"x-sgi-movie" : "movie",
			"x-matroska" : [ "mpv", "mkv", "mk3d", "mks" ],
			"3gpp2" : "3g2",
			"h261" : "h261",
			"h263" : "h263",
			"h264" : "h264",
			"jpeg" : "jpgv",
			"jpm" : [ "jpm", "jpgm" ],
			"mj2" : [ "mj2", "mjp2" ],
			"vnd.dece.hd" : [ "uvh", "uvvh" ],
			"vnd.dece.mobile" : [ "uvm", "uvvm" ],
			"vnd.dece.pd" : [ "uvp", "uvvp" ],
			"vnd.dece.sd" : [ "uvs", "uvvs" ],
			"vnd.dece.video" : [ "uvv", "uvvv" ],
			"vnd.dvb.file" : "dvb",
			"vnd.fvt" : "fvt",
			"vnd.ms-playready.media.pyv" : "pyv",
			"vnd.uvvu.mp4" : [ "uvu", "uvvu" ],
			"vnd.vivo" : "viv",
			"webm" : "webm",
			"x-f4v" : "f4v",
			"x-m4v" : "m4v",
			"x-ms-vob" : "vob",
			"x-smv" : "smv"
		},
		"x-conference" : {
			"x-cooltalk" : "ice"
		},
		"x-world" : {
			"x-vrml" : [ "vrm", "vrml", "wrl", "flr", "wrz", "xaf", "xof" ]
		}
	};

	var mimeTypes = (function() {
		var type, subtype, val, index, mimeTypes = {};
		for (type in table) {
			if (table.hasOwnProperty(type)) {
				for (subtype in table[type]) {
					if (table[type].hasOwnProperty(subtype)) {
						val = table[type][subtype];
						if (typeof val == "string") {
							mimeTypes[val] = type + "/" + subtype;
						} else {
							for (index = 0; index < val.length; index++) {
								mimeTypes[val[index]] = type + "/" + subtype;
							}
						}
					}
				}
			}
		}
		return mimeTypes;
	})();


	var ERR_BAD_FORMAT = "File format is not recognized.";
	var ERR_ENCRYPTED = "File contains encrypted entry.";
	var ERR_ZIP64 = "File is using Zip64 (4gb+ file size).";
	var ERR_READ = "Error while reading zip file.";
	var ERR_WRITE = "Error while writing zip file.";
	var ERR_WRITE_DATA = "Error while writing file data.";
	var ERR_READ_DATA = "Error while reading file data.";
	var ERR_DUPLICATED_NAME = "File already exists.";
	var ERR_HTTP_RANGE = "HTTP Range not supported.";
	var CHUNK_SIZE = 512 * 1024;

	var INFLATE_JS = "inflate.js";
	var DEFLATE_JS = "deflate.js";

	var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

	var appendABViewSupported;

	function isAppendABViewSupported() {
		if (typeof appendABViewSupported == "undefined") {
			var blobBuilder;
			blobBuilder = new BlobBuilder();
			blobBuilder.append(getDataHelper(0).view);
			appendABViewSupported = blobBuilder.getBlob().size == 0;
		}
		return appendABViewSupported;
	}

	function Crc32() {
		var crc = -1, that = this;
		that.append = function(data) {
			var offset, table = that.table;
			for (offset = 0; offset < data.length; offset++)
				crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
		};
		that.get = function() {
			return ~crc;
		};
	}
	Crc32.prototype.table = (function() {
		var i, j, t, table = [];
		for (i = 0; i < 256; i++) {
			t = i;
			for (j = 0; j < 8; j++)
				if (t & 1)
					t = (t >>> 1) ^ 0xEDB88320;
				else
					t = t >>> 1;
			table[i] = t;
		}
		return table;
	})();

	function blobSlice(blob, index, length) {
		if (blob.slice)
			return blob.slice(index, index + length);
		else if (blob.webkitSlice)
			return blob.webkitSlice(index, index + length);
		else if (blob.mozSlice)
			return blob.mozSlice(index, index + length);
		else if (blob.msSlice)
			return blob.msSlice(index, index + length);
	}

	function getDataHelper(byteLength, bytes) {
		var dataBuffer, dataArray;
		dataBuffer = new ArrayBuffer(byteLength);
		dataArray = new Uint8Array(dataBuffer);
		if (bytes)
			dataArray.set(bytes, 0);
		return {
			buffer : dataBuffer,
			array : dataArray,
			view : new DataView(dataBuffer)
		};
	}

	// Readers
	function Reader() {
	}

	function TextReader(text) {
		var that = this, blobReader;

		function init(callback, onerror) {
			var blobBuilder = new BlobBuilder();
			blobBuilder.append(text);
			blobReader = new BlobReader(blobBuilder.getBlob("text/plain"));
			blobReader.init(function() {
				that.size = blobReader.size;
				callback();
			}, onerror);
		}

		function readUint8Array(index, length, callback, onerror) {
			blobReader.readUint8Array(index, length, callback, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	TextReader.prototype = new Reader();
	TextReader.prototype.constructor = TextReader;

	function Data64URIReader(dataURI) {
		var that = this, dataStart;

		function init(callback) {
			var dataEnd = dataURI.length;
			while (dataURI.charAt(dataEnd - 1) == "=")
				dataEnd--;
			dataStart = dataURI.indexOf(",") + 1;
			that.size = Math.floor((dataEnd - dataStart) * 0.75);
			callback();
		}

		function readUint8Array(index, length, callback) {
			var i, data = getDataHelper(length);
			var start = Math.floor(index / 3) * 4;
			var end = Math.ceil((index + length) / 3) * 4;
			var bytes = window.atob(dataURI.substring(start + dataStart, end + dataStart));
			var delta = index - Math.floor(start / 4) * 3;
			for (i = delta; i < delta + length; i++)
				data.array[i - delta] = bytes.charCodeAt(i);
			callback(data.array);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	Data64URIReader.prototype = new Reader();
	Data64URIReader.prototype.constructor = Data64URIReader;

	function BlobReader(blob) {
		var that = this;

		function init(callback) {
			this.size = blob.size;
			callback();
		}

		function readUint8Array(index, length, callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(new Uint8Array(e.target.result));
			};
			reader.onerror = onerror;
			reader.readAsArrayBuffer(blobSlice(blob, index, length));
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	BlobReader.prototype = new Reader();
	BlobReader.prototype.constructor = BlobReader;

	function HttpReader(url) {
		var that = this;

		function getData(callback, onerror) {
			var request;
			if (!that.data) {
				request = new XMLHttpRequest();
				request.addEventListener("load", function() {
					if (!that.size)
						that.size = Number(request.getResponseHeader("Content-Length"));
					that.data = new Uint8Array(request.response);
					callback();
				}, false);
				request.addEventListener("error", onerror, false);
				request.open("GET", url);
				request.responseType = "arraybuffer";
				request.send();
			} else
				callback();
		}

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				callback();
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			getData(function() {
				callback(new Uint8Array(that.data.subarray(index, index + length)));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpReader.prototype = new Reader();
	HttpReader.prototype.constructor = HttpReader;

	function HttpRangeReader(url) {
		var that = this;

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				if (request.getResponseHeader("Accept-Ranges") == "bytes")
					callback();
				else
					onerror(ERR_HTTP_RANGE);
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readArrayBuffer(index, length, callback, onerror) {
			var request = new XMLHttpRequest();
			request.open("GET", url);
			request.responseType = "arraybuffer";
			request.setRequestHeader("Range", "bytes=" + index + "-" + (index + length - 1));
			request.addEventListener("load", function() {
				callback(request.response);
			}, false);
			request.addEventListener("error", onerror, false);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			readArrayBuffer(index, length, function(arraybuffer) {
				callback(new Uint8Array(arraybuffer));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpRangeReader.prototype = new Reader();
	HttpRangeReader.prototype.constructor = HttpRangeReader;

	// Writers

	function Writer() {
	}
	Writer.prototype.getData = function(callback) {
		callback(this.data);
	};

	function TextWriter() {
		var that = this, blobBuilder;

		function init(callback) {
			blobBuilder = new BlobBuilder();
			callback();
		}

		function writeUint8Array(array, callback) {
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			callback();
		}

		function getData(callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(e.target.result);
			};
			reader.onerror = onerror;
			reader.readAsText(blobBuilder.getBlob("text/plain"));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	TextWriter.prototype = new Writer();
	TextWriter.prototype.constructor = TextWriter;

	function Data64URIWriter(contentType) {
		var that = this, data = "", pending = "";

		function init(callback) {
			data += "data:" + (contentType || "") + ";base64,";
			callback();
		}

		function writeUint8Array(array, callback) {
			var i, delta = pending.length, dataString = pending;
			pending = "";
			for (i = 0; i < (Math.floor((delta + array.length) / 3) * 3) - delta; i++)
				dataString += String.fromCharCode(array[i]);
			for (; i < array.length; i++)
				pending += String.fromCharCode(array[i]);
			if (dataString.length > 2)
				data += window.btoa(dataString);
			else
				pending = dataString;
			callback();
		}

		function getData(callback) {
			callback(data + window.btoa(pending));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	Data64URIWriter.prototype = new Writer();
	Data64URIWriter.prototype.constructor = Data64URIWriter;

	function FileWriter(fileEntry, contentType) {
		var writer, that = this;

		function init(callback, onerror) {
			fileEntry.createWriter(function(fileWriter) {
				writer = fileWriter;
				callback();
			}, onerror);
		}

		function writeUint8Array(array, callback, onerror) {
			var blobBuilder = new BlobBuilder();
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			writer.onwrite = function() {
				writer.onwrite = null;
				callback();
			};
			writer.onerror = onerror;
			writer.write(blobBuilder.getBlob(contentType));
		}

		function getData(callback) {
			fileEntry.file(callback);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	FileWriter.prototype = new Writer();
	FileWriter.prototype.constructor = FileWriter;

	function BlobWriter(contentType) {
		var blobBuilder, that = this;

		function init(callback) {
			blobBuilder = new BlobBuilder();
			callback();
		}

		function writeUint8Array(array, callback) {
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			callback();
		}

		function getData(callback) {
			callback(blobBuilder.getBlob(contentType));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	BlobWriter.prototype = new Writer();
	BlobWriter.prototype.constructor = BlobWriter;

	// inflate/deflate core functions

	function launchWorkerProcess(worker, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize;

		function onflush() {
			worker.removeEventListener("message", onmessage, false);
			onend(outputSize);
		}

		function onmessage(event) {
			var message = event.data, data = message.data;

			if (message.onappend) {
				outputSize += data.length;
				writer.writeUint8Array(data, function() {
					onappend(false, data);
					step();
				}, onwriteerror);
			}
			if (message.onflush)
				if (data) {
					outputSize += data.length;
					writer.writeUint8Array(data, function() {
						onappend(false, data);
						onflush();
					}, onwriteerror);
				} else
					onflush();
			if (message.progress && onprogress)
				onprogress(index + message.current, size);
		}

		function step() {
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
					worker.postMessage({
						append : true,
						data : array
					});
					chunkIndex++;
					if (onprogress)
						onprogress(index, size);
					onappend(true, array);
				}, onreaderror);
			else
				worker.postMessage({
					flush : true
				});
		}

		outputSize = 0;
		worker.addEventListener("message", onmessage, false);
		step();
	}

	function launchProcess(process, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize = 0;

		function step() {
			var outputData;
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(inputData) {
					var outputData = process.append(inputData, function() {
						if (onprogress)
							onprogress(offset + index, size);
					});
					outputSize += outputData.length;
					onappend(true, inputData);
					writer.writeUint8Array(outputData, function() {
						onappend(false, outputData);
						chunkIndex++;
						setTimeout(step, 1);
					}, onwriteerror);
					if (onprogress)
						onprogress(index, size);
				}, onreaderror);
			else {
				outputData = process.flush();
				if (outputData) {
					outputSize += outputData.length;
					writer.writeUint8Array(outputData, function() {
						onappend(false, outputData);
						onend(outputSize);
					}, onwriteerror);
				} else
					onend(outputSize);
			}
		}

		step();
	}

	function inflate(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var worker, crc32 = new Crc32();

		function oninflateappend(sending, array) {
			if (computeCrc32 && !sending)
				crc32.append(array);
		}

		function oninflateend(outputSize) {
			onend(outputSize, crc32.get());
		}

		if (zip.useWebWorkers) {
			worker = new Worker(zip.workerScriptsPath + INFLATE_JS);
			launchWorkerProcess(worker, reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
		} else
			launchProcess(new zip.Inflater(), reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
		return worker;
	}

	function deflate(reader, writer, level, onend, onprogress, onreaderror, onwriteerror) {
		var worker, crc32 = new Crc32();

		function ondeflateappend(sending, array) {
			if (sending)
				crc32.append(array);
		}

		function ondeflateend(outputSize) {
			onend(outputSize, crc32.get());
		}

		function onmessage() {
			worker.removeEventListener("message", onmessage, false);
			launchWorkerProcess(worker, reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
		}

		if (zip.useWebWorkers) {
			worker = new Worker(zip.workerScriptsPath + DEFLATE_JS);
			worker.addEventListener("message", onmessage, false);
			worker.postMessage({
				init : true,
				level : level
			});
		} else
			launchProcess(new zip.Deflater(), reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
		return worker;
	}

	function copy(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var chunkIndex = 0, crc32 = new Crc32();

		function step() {
			var index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
					if (computeCrc32)
						crc32.append(array);
					if (onprogress)
						onprogress(index, size, array);
					writer.writeUint8Array(array, function() {
						chunkIndex++;
						step();
					}, onwriteerror);
				}, onreaderror);
			else
				onend(size, crc32.get());
		}

		step();
	}

	// ZipReader

	function decodeASCII(str) {
		var i, out = "", charCode, extendedASCII = [ '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB',
				'\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9',
				'\u00FF', '\u00D6', '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1', '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1',
				'\u00AA', '\u00BA', '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB', '\u00BB', '_', '_', '_', '\u00A6', '\u00A6',
				'\u00C1', '\u00C2', '\u00C0', '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-', '-', '+', '-', '+', '\u00E3',
				'\u00C3', '+', '+', '-', '-', '\u00A6', '-', '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i', '\u00CD', '\u00CE',
				'\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_', '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5', '\u00FE',
				'\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD', '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
				'\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3', '\u00B2', '_', ' ' ];
		for (i = 0; i < str.length; i++) {
			charCode = str.charCodeAt(i) & 0xFF;
			if (charCode > 127)
				out += extendedASCII[charCode - 128];
			else
				out += String.fromCharCode(charCode);
		}
		return out;
	}

	function decodeUTF8(str_data) {
		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;

		str_data += '';

		while (i < str_data.length) {
			c1 = str_data.charCodeAt(i);
			if (c1 < 128) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			} else if (c1 > 191 && c1 < 224) {
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return tmp_arr.join('');
	}

	function getString(bytes) {
		var i, str = "";
		for (i = 0; i < bytes.length; i++)
			str += String.fromCharCode(bytes[i]);
		return str;
	}

	function getDate(timeRaw) {
		var date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & 0x0000ffff;
		try {
			return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5,
					(time & 0x001F) * 2, 0);
		} catch (e) {
		}
	}

	function readCommonHeader(entry, data, index, centralDirectory, onerror) {
		entry.version = data.view.getUint16(index, true);
		entry.bitFlag = data.view.getUint16(index + 2, true);
		entry.compressionMethod = data.view.getUint16(index + 4, true);
		entry.lastModDateRaw = data.view.getUint32(index + 6, true);
		entry.lastModDate = getDate(entry.lastModDateRaw);
		if ((entry.bitFlag & 0x01) === 0x01) {
			onerror(ERR_ENCRYPTED);
			return;
		}
		if (centralDirectory || (entry.bitFlag & 0x0008) != 0x0008) {
			entry.crc32 = data.view.getUint32(index + 10, true);
			entry.compressedSize = data.view.getUint32(index + 14, true);
			entry.uncompressedSize = data.view.getUint32(index + 18, true);
		}
		if (entry.compressedSize === 0xFFFFFFFF || entry.uncompressedSize === 0xFFFFFFFF) {
			onerror(ERR_ZIP64);
			return;
		}
		entry.filenameLength = data.view.getUint16(index + 22, true);
		entry.extraFieldLength = data.view.getUint16(index + 24, true);
	}

	function createZipReader(reader, onerror) {
		function Entry() {
		}

		Entry.prototype.getData = function(writer, onend, onprogress, checkCrc32) {
			var that = this, worker;

			function terminate(callback, param) {
				if (worker)
					worker.terminate();
				worker = null;
				if (callback)
					callback(param);
			}

			function testCrc32(crc32) {
				var dataCrc32 = getDataHelper(4);
				dataCrc32.view.setUint32(0, crc32);
				return that.crc32 == dataCrc32.view.getUint32(0);
			}

			function getWriterData(uncompressedSize, crc32) {
				if (checkCrc32 && !testCrc32(crc32))
					onreaderror();
				else
					writer.getData(function(data) {
						terminate(onend, data);
					});
			}

			function onreaderror() {
				terminate(onerror, ERR_READ_DATA);
			}

			function onwriteerror() {
				terminate(onerror, ERR_WRITE_DATA);
			}

			reader.readUint8Array(that.offset, 30, function(bytes) {
				var data = getDataHelper(bytes.length, bytes), dataOffset;
				if (data.view.getUint32(0) != 0x504b0304) {
					onerror(ERR_BAD_FORMAT);
					return;
				}
				readCommonHeader(that, data, 4, false, function(error) {
					onerror(error);
					return;
				});
				dataOffset = that.offset + 30 + that.filenameLength + that.extraFieldLength;
				writer.init(function() {
					if (that.compressionMethod === 0)
						copy(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
					else
						worker = inflate(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
				}, onwriteerror);
			}, onreaderror);
		};

		function seekEOCDR(offset, entriesCallback) {
			reader.readUint8Array(reader.size - offset, offset, function(bytes) {
				var dataView = getDataHelper(bytes.length, bytes).view;
				if (dataView.getUint32(0) != 0x504b0506) {
					seekEOCDR(offset+1, entriesCallback);
				} else {
					entriesCallback(dataView);
				}
			}, function() {
				onerror(ERR_READ);
			});
		}
		
		return {
			getEntries : function(callback) {
				if (reader.size < 22) {
					onerror(ERR_BAD_FORMAT);
					return;
				}
				// look for End of central directory record
				seekEOCDR(22, function(dataView) {
					datalength = dataView.getUint32(16, true);
					fileslength = dataView.getUint16(8, true);
					reader.readUint8Array(datalength, reader.size - datalength, function(bytes) {
						var i, index = 0, entries = [], entry, filename, comment, data = getDataHelper(bytes.length, bytes);
						for (i = 0; i < fileslength; i++) {
							entry = new Entry();
							if (data.view.getUint32(index) != 0x504b0102) {
								onerror(ERR_BAD_FORMAT);
								return;
							}
							readCommonHeader(entry, data, index + 6, true, function(error) {
								onerror(error);
								return;
							});
							entry.commentLength = data.view.getUint16(index + 32, true);
							entry.directory = ((data.view.getUint8(index + 38) & 0x10) == 0x10);
							entry.offset = data.view.getUint32(index + 42, true);
							filename = getString(data.array.subarray(index + 46, index + 46 + entry.filenameLength));
							entry.filename = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(filename) : decodeASCII(filename);
							if (!entry.directory && entry.filename.charAt(entry.filename.length - 1) == "/")
								entry.directory = true;
							comment = getString(data.array.subarray(index + 46 + entry.filenameLength + entry.extraFieldLength, index + 46
									+ entry.filenameLength + entry.extraFieldLength + entry.commentLength));
							entry.comment = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(comment) : decodeASCII(comment);
							entries.push(entry);
							index += 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength;
						}
						callback(entries);
					}, function() {
						onerror(ERR_READ);
					});
				});
			},
			close : function(callback) {
				if (callback)
					callback();
			}
		};
	}

	// ZipWriter

	function encodeUTF8(string) {
		var n, c1, enc, utftext = [], start = 0, end = 0, stringl = string.length;
		for (n = 0; n < stringl; n++) {
			c1 = string.charCodeAt(n);
			enc = null;
			if (c1 < 128)
				end++;
			else if (c1 > 127 && c1 < 2048)
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			else
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			if (enc != null) {
				if (end > start)
					utftext += string.slice(start, end);
				utftext += enc;
				start = end = n + 1;
			}
		}
		if (end > start)
			utftext += string.slice(start, stringl);
		return utftext;
	}

	function getBytes(str) {
		var i, array = [];
		for (i = 0; i < str.length; i++)
			array.push(str.charCodeAt(i));
		return array;
	}

	function createZipWriter(writer, onerror, dontDeflate) {
		var worker, files = [], filenames = [], datalength = 0;

		function terminate(callback, message) {
			if (worker)
				worker.terminate();
			worker = null;
			if (callback)
				callback(message);
		}

		function onwriteerror() {
			terminate(onerror, ERR_WRITE);
		}

		function onreaderror() {
			terminate(onerror, ERR_READ_DATA);
		}

		return {
			add : function(name, reader, onend, onprogress, options) {
				var header, filename, date;

				function writeHeader(callback) {
					var data;
					date = options.lastModDate || new Date();
					header = getDataHelper(26);
					files[name] = {
						headerArray : header.array,
						directory : options.directory,
						filename : filename,
						offset : datalength,
						comment : getBytes(encodeUTF8(options.comment || ""))
					};
					header.view.setUint32(0, 0x14000808);
					if (options.version)
						header.view.setUint8(0, options.version);
					if (!dontDeflate && options.level != 0)
						header.view.setUint16(4, 0x0800);
					header.view.setUint16(6, (((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2, true);
					header.view.setUint16(8, ((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate(), true);
					header.view.setUint16(22, filename.length, true);
					data = getDataHelper(30 + filename.length);
					data.view.setUint32(0, 0x504b0304);
					data.array.set(header.array, 4);
					data.array.set([], 30); // FIXME: remove when chrome 18 will be stable (14: OK, 16: KO, 17: OK)
					data.array.set(filename, 30);
					datalength += data.array.length;
					writer.writeUint8Array(data.array, callback, onwriteerror);
				}

				function writeFooter(compressedLength, crc32) {
					var footer = getDataHelper(16);
					datalength += compressedLength || 0;
					footer.view.setUint32(0, 0x504b0708);
					if (typeof crc32 != "undefined") {
						header.view.setUint32(10, crc32, true);
						footer.view.setUint32(4, crc32, true);
					}
					if (reader) {
						footer.view.setUint32(8, compressedLength, true);
						header.view.setUint32(14, compressedLength, true);
						footer.view.setUint32(12, reader.size, true);
						header.view.setUint32(18, reader.size, true);
					}
					writer.writeUint8Array(footer.array, function() {
						datalength += 16;
						terminate(onend);
					}, onwriteerror);
				}

				function writeFile() {
					options = options || {};
					name = name.trim();
					if (options.directory && name.charAt(name.length - 1) != "/")
						name += "/";
					if (files[name])
						throw ERR_DUPLICATED_NAME;
					filename = getBytes(encodeUTF8(name));
					filenames.push(name);
					writeHeader(function() {
						if (reader)
							if (dontDeflate || options.level == 0)
								copy(reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);
							else
								worker = deflate(reader, writer, options.level, writeFooter, onprogress, onreaderror, onwriteerror);
						else
							writeFooter();
					}, onwriteerror);
				}

				if (reader)
					reader.init(writeFile, onreaderror);
				else
					writeFile();
			},
			close : function(callback) {
				var data, length = 0, index = 0;
				filenames.forEach(function(name) {
					var file = files[name];
					length += 46 + file.filename.length + file.comment.length;
				});
				data = getDataHelper(length + 22);
				filenames.forEach(function(name) {
					var file = files[name];
					data.view.setUint32(index, 0x504b0102);
					data.view.setUint16(index + 4, 0x1400);
					data.array.set(file.headerArray, index + 6);
					data.view.setUint16(index + 32, file.comment.length, true);
					if (file.directory)
						data.view.setUint8(index + 38, 0x10);
					data.view.setUint32(index + 42, file.offset, true);
					data.array.set(file.filename, index + 46);
					data.array.set(file.comment, index + 46 + file.filename.length);
					index += 46 + file.filename.length + file.comment.length;
				});
				data.view.setUint32(index, 0x504b0506);
				data.view.setUint16(index + 8, filenames.length, true);
				data.view.setUint16(index + 10, filenames.length, true);
				data.view.setUint32(index + 12, length, true);
				data.view.setUint32(index + 16, datalength, true);
				writer.writeUint8Array(data.array, function() {
					terminate(function() {
						writer.getData(callback);
					});
				}, onwriteerror);
			}
		};
	}

	if (typeof BlobBuilder == "undefined") {
		BlobBuilder = function() {
			var that = this, blobParts;

			function initBlobParts() {
				if (!blobParts) {
					blobParts = [ new Blob() ]
				}
			}

			that.append = function(data) {
				initBlobParts();
				blobParts.push(data);
			};
			that.getBlob = function(contentType) {
				initBlobParts();
				if (blobParts.length > 1 || blobParts[0].type != contentType) {
					blobParts = [ contentType ? new Blob(blobParts, {
						type : contentType
					}) : new Blob(blobParts) ];
				}
				return blobParts[0];
			};
		};
	}

	zip.Reader = Reader;
	zip.Writer = Writer;
	zip.BlobReader = BlobReader;
	zip.HttpReader = HttpReader;
	zip.HttpRangeReader = HttpRangeReader;
	zip.Data64URIReader = Data64URIReader;
	zip.TextReader = TextReader;
	zip.BlobWriter = BlobWriter;
	zip.FileWriter = FileWriter;
	zip.Data64URIWriter = Data64URIWriter;
	zip.TextWriter = TextWriter;
	zip.createReader = function(reader, callback, onerror) {
		reader.init(function() {
			callback(createZipReader(reader, onerror));
		}, onerror);
	};
	zip.createWriter = function(writer, callback, onerror, dontDeflate) {
		writer.init(function() {
			callback(createZipWriter(writer, onerror, dontDeflate));
		}, onerror);
	};
	zip.workerScriptsPath = "";
	zip.useWebWorkers = false;
	zip.getMimeType = function(filename) {
		var defaultValue = "application/octet-stream";
		return filename ? mimeTypes[filename.split(".").pop()] || defaultValue : defaultValue;
	};
	zip.dataURItoBlob = function ( dataURI ) {

		var sa = dataURI.split(',');
		var byteString = atob(sa[1]);

		var mimeString = sa[0].split(':')[1].split(';')[0];

		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob( [ new DataView( ab ) ], { type:mimeString } )

	};

	zip.zipFile = function( file, writer, callback, progress ){

		writer.add( file.name, new zip.BlobReader( file ), function( ){
			callback && callback( null );
		}, progress, { level: 9 } );

	};

	zip.zipFiles = ( function( ){
		var lastName, lastSize;
		return function( files, callback, progress ){
			zip.createWriter(

				new zip.BlobWriter( 'application/zip' ), 

				function( zipWriter ) {

					async.each( files, function( file, callback ){

						zip.zipFile( file, zipWriter, callback, function( current, total ){

							lastName = file.name;
							lastSize = total;
							progress && progress( lastName, current, total );

						} );

					}, function( ){

						progress && progress( lastName, lastSize, lastSize );
						zipWriter.close( callback );

					} );

				}

			);

		};

	} )( )

	module.exports = zip;

} );