import { useSettingStore } from "@/stores";
import dayjs from "dayjs";
import { ElLoading } from "element-plus";
/* import { utils, writeFile } from "xlsx"; */
import { ref } from "vue";
import { formatNumber } from "./numbers";
/* import * as XLSX from 'xlsx-js-style'; */

// import type { Plugin } from 'vue'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import i18n from "@/i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 *
 * @param component 需要注册的组件
 * @param alias 组件别名
 * @returns any
 */
export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any;
  comp.install = (app: any) => {
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};

/**
 * @param str 需要转下划线的驼峰字符串
 * @returns 字符串下划线
 */
export const humpToUnderline = (str: string): string => {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
};

/**
 * @param str 需要转驼峰的下划线字符串
 * @returns 字符串驼峰
 */
export const underlineToHump = (str: string): string => {
  if (!str) return "";
  return str.replace(/\-(\w)/g, (_, letter: string) => {
    return letter.toUpperCase();
  });
};

export const setCssVar = (prop: string, val: any, dom = document.documentElement) => {
  dom.style.setProperty(prop, val);
};

export const trim = (str: string) => {
  return str.replace(/(^\s*)|(\s*$)/g, "");
};

/**
 * @param {Date | number | string} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatTime(time: Date | number | string, fmt: string = "dd/MM/yyyy HH:mm:ss") {
  if (!time) return "";
  else {
    const date = new Date(time);
    const o: any = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "H+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return fmt;
  }
}

export const formatDate = (date: Date | number | string, format: string = "DD/MM/YYYY HH:mm:ss"): string => {
  if (!date) return "N/A";
  return dayjs(date).format(format);
};

export const tzFormatDate = (date: Date | number | string, format: string = "DD/MM/YYYY HH:mm:ss"): string => {
  if (!date) return "N/A";
  return dayjs.utc(date).tz().format(format);
};

export const compareDates = (
  currentDate: any,
  compareDate: any,
  term: string = "isBefore",
  add: number = 0,
  type: string = "d",
): boolean => {
  if (!currentDate || !compareDate) return false;

  if (term == "isBefore") {
    return dayjs
      .utc(currentDate)
      .tz()
      .isBefore(
        dayjs
          .utc(compareDate)
          .tz()
          .add(add, type as any),
      );
  }

  if (term == "isAfter") {
    return dayjs
      .utc(currentDate)
      .tz()
      .isAfter(
        dayjs
          .utc(compareDate)
          .tz()
          .add(add, type as any),
      );
  }

  return dayjs
    .utc(currentDate)
    .tz()
    .isSame(
      dayjs
        .utc(compareDate)
        .tz()
        .add(add, type as any),
    );
};

/**
 * 生成随机字符串
 */
export function toAnyString() {
  const str: string = "xxxxx-xxxxx-4xxxx-yxxxx-xxxxx".replace(/[xy]/g, (c: string) => {
    const r: number = (Math.random() * 16) | 0;
    const v: number = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString();
  });
  return str;
}

export const generalLoader = () => {
  return ElLoading.service({
    lock: true,
    text: i18n.global.t("loading"),
    background: "rgba(245, 245, 245, 0.93)",
    customClass: "loader-text",
  });
};

/**
 * Cette fonction retourne l'heure du jour
 * @returns l'heure, les minutes et les secondes
 */
export const showCurrentHour = (): string => {
  let date = new Date();
  let hour = date.getHours(); // 0 - 23
  let minutes = date.getMinutes(); // 0 - 59
  let second = date.getSeconds(); // 0 - 59

  const newHour = hour < 10 ? `0${hour}` : hour;
  const newMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const newSecond = second < 10 ? `0${second}` : second;

  return `${newHour}:${newMinutes}:${newSecond}`;
};

/**
 * Cette fonction s'occupe de la pagination de tous les tableaux sur la vue
 */
export const useShortTablePerPage = (): any => {
  const pagination = ref({
    pageSize: 10,
    currentPageNumb: 1,
    totalData: 0,
    customPageSizesConfig: [10, 20, 50, 100],
  });

  /**
   * Cette fonction se charge de trier un tableau en fonction du nombre qu'on souhaite
   * @param {Array} array Le tableau à trier
   * @returns {Array} retourne le tableau trié en fonction du nombre à afficher par page
   */
  const shortTable = (array: any[] = []): any[] => {
    // Nombre total de page
    pagination.value.totalData = array.length;

    let start = pagination.value.currentPageNumb - 1;

    const end = pagination.value.pageSize * pagination.value.currentPageNumb;

    if (pagination.value.currentPageNumb > 1) {
      start = start * pagination.value.pageSize;
    }
    return array?.slice(start, end);
  };

  /**
   * cette fonction met à jour la page à afficher
   * @param {number} number Le nombre à ajouter
   */
  const updatePagination = (number: number) => {
    pagination.value.currentPageNumb = number;
  };

  /**
   * Cette fonction met à jour le nombre de données à afficher dans un page
   * @param {number} perPage elle prend le d'élément à afficher
   */
  const updateSize = (perPage: number = 10) => {
    pagination.value.pageSize = perPage ?? pagination.value.pageSize;
  };

  return {
    shortTable,
    updatePagination,
    updateSize,
    pagination: pagination.value,
  };
};

/* export function exportHelper(data: any[] = [], filename: string = "items-list") {
  const items = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, items);
  writeFile(workbook, `${filename}.xlsx`, { compression: true });
}

export const exportWithStyleHelper = (data: any[] = [], filename: string = "items-list") => {
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  for (var i in worksheet) {
    if (typeof worksheet[i] != 'object') continue;
    let cell = XLSX.utils.decode_cell(i);

    worksheet[i].s = {
      // styling for all cells
      font: {
        name: 'Arial',
        sz: "13"
      },
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true, // any truthy value here
      },
      border: {
        right: {
          style: 'thin',
          color: '000000',
        },
        left: {
          style: 'thin',
          color: '000000',
        },
        top: {
          style: 'thin',
          color: '000000',
        },
        bottom: {
          style: 'thin',
          color: '000000',
        },
      },
    };

    // first row
    if (cell.r == 0) {
      worksheet[i].s.fill = {
        // background color
        patternType: 'solid',
        color: 'ffffff',
        fgColor: { rgb: 'ff7900' },
        bgColor: { rgb: 'ff7900' },
      };

      // font
      worksheet[i].s.font = {
        bold: true,
      }
    }

    if (cell.r % 2) {
      // every other row
      worksheet[i].s.fill = {
        // background color
        patternType: 'solid',
        fgColor: { rgb: 'f4f4f4' },
        bgColor: { rgb: 'f4f4f4' },
      };
    }
  }
  const header = Object.keys(data[0]); // columns name

  let wscols = [{ width: 25 }];

  header.map((el: any) => wscols.push({ width: el.length + 15 }));

  worksheet['!cols'] = wscols;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`, { compression: true });

} */

export const formatAmountFCFA = (value: string | number, currency: boolean = true): string => {
  value = value == "_" ? 0 : value == "NaN" ? 0 : value;
  return `${formatNumber(value, "decimal", "de-DE")} ${currency ? "F CFA" : ""}`;
};

export function timeFormat(duration: number) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

export function convertObjectToQueryParams(params: any): string {
  let param: string = "";
  for (let item in params) {
    const value = params[item];
    if (value) {
      param += param == "" ? `?${item}=${value}` : `&${item}=${value}`;
    }
  }
  return param;
}

export function capitalize(v: string): string {
  let letters: string[] = v.split("");
  let first: string | undefined = letters.shift();
  return `${first?.toUpperCase()}${letters.join("")}`;
}

/**
 * Cette fonction format les clés d'un tableau d'ojet de sort que les données soient libile lors de l'exportation (Elle est spécialement consu pour l'export des données des entreprises)
 * @param array le tableau à exporter
 * @returns {Array} retourn un tableau avec des clés lisible
 */
export const customCompanyExportData = (array: any[] = []): any[] => {
  let result: any[] = [];

  result = array.map((el: any) => {
    let data: any = {};

    // company info
    data["Numéro unique de l'entreprise"] = el.Company?.UniqueIdNumber ?? "";
    data["Nom de l'entreprise"] = el.Company?.TradeName ?? "";
    data["Secteur d'activité"] = el.Company?.ActivitiesField ?? "";
    data["Taille"] = el.Company?.Size ? el.Company?.Size.toUpperCase() : "";
    data["Numéro de l'entreprise"] = el.Company?.companyHeadMsisdn ?? "";
    data["Numéro du representant"] = el.Company?.RepresentativeNumber ?? "";
    data["Contact supplémentaire"] = el.Company?.Additionalcontact ?? "";
    data["Ville"] = el.Company?.City ?? "";
    data["Adresse"] = el.Company?.Address ?? "";
    data["Heure d'ouverture"] = el.Company?.OpeningHours ?? "";
    data["Heure de fermeture"] = el.Company?.ClosingTime ?? "";
    data["Commentaire"] = el.Company?.Comment ?? "";
    data["Date de création"] = formatTime(el.CreateDate, "dd/MM/yyyy HH:mm:ss");
    data["En attente d'approbation"] = el.Company?.AwaitingApproval ? "Oui" : "Non";
    data["Activé"] = el.Company?.Statut ? "Oui" : "Non";

    // Company actions
    data["Création initée par"] = el.Init_By ?? "";
    data["Création approuvée par"] = el.Approuve_By ?? "";
    data["Date d'approbation"] = formatTime(el.ValidatedDate, "dd/MM/yyyy HH:mm:ss");
    data["Dernière mise à jour initée par"] = el.LastUpdateInit_By ?? "";
    data["Dernière date d'initiation de la mise à jour"] = formatTime(el.LastInitUpdateDate, "dd/MM/yyyy HH:mm:ss");
    data["Dernière mise à jour approuvée par"] = el.LastUpdateApprouve_By ?? "";
    data["Dernière date d'approbation de la mise à jour"] = formatTime(
      el.LastApprouveUpdateDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière désactivation initée par"] = el.LastDesactivationInit_By ?? "";
    data["Dernière date d'initiation de la désactivation"] = formatTime(
      el.LastInitDesactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière désactivation approuvée par"] = el.LastDesactivationApprouve_By ?? "";
    data["Dernière date d'approbation de la désactivation"] = formatTime(
      el.LastApprouveDesactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière activation initée par"] = el.LastResactivationInit_By ?? "";
    data["Dernière date d'initiation de l'activation"] = formatTime(
      el.LastInitResactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière activation approuvée par"] = el.LastResactivationApprouve_By ?? "";
    data["Dernière date d'activation"] = formatTime(el.LastApprouveResactivationDate, "dd/MM/yyyy HH:mm:ss");

    return data;
  });

  return result;
};

/**
 * Cette fonction format les clés d'un tableau d'ojet de sort que les données soient libile lors de l'exportation (Elle est spécialement consu pour l'export des données des utilisateurs)
 * @param {Array} array le tableau à exporter
 * @returns {Array} retourn un tableau avec des clés lisible
 */
export const customUserExportData = (array: any[] = []): any[] => {
  let result: any[] = [];

  result = array.map((el: any) => {
    let data: any = {};

    // User info
    data["Nom"] = el.User?.familyName ?? "";
    data["Prénoms"] = el.User?.firstname ?? "";
    data["Email"] = el.User?.email ?? "";
    data["Numéro"] = el.User?.msisdn ?? "";
    data["Login"] = el.User?.login ?? "";
    data["Profil"] = el.User?.profil ?? "";
    data["Entreprise"] = el.userCompanyInfo?.TradeName ?? "";
    data["Date de création"] = formatTime(el.CreateDate, "dd/MM/yyyy HH:mm:ss");
    data["En attente d'approbation"] = el.User?.AwaitingApproval ? "Oui" : "Non";
    data["Activé"] = el.User?.statut ? "Oui" : "Non";

    // user actions
    data["Création initée par"] = el.Init_By ?? "";
    data["Création approuvée par"] = el.Approuve_By ?? "";
    data["Date d'approbation"] = formatTime(el.ValidatedDate, "dd/MM/yyyy HH:mm:ss");
    data["Dernière mise à jour initée par"] = el.LastUpdateInit_By ?? "";
    data["Dernière date d'initiation de la mise à jour"] = formatTime(el.LastInitUpdateDate, "dd/MM/yyyy HH:mm:ss");
    data["Dernière mise à jour approuvée par"] = el.LastUpdateApprouve_By ?? "";
    data["Dernière date d'approbation de la mise à jour"] = formatTime(
      el.LastApprouveUpdateDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière désactivation initée par"] = el.LastDesactivationInit_By ?? "";
    data["Dernière date d'initiation de la désactivation"] = formatTime(
      el.LastInitDesactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière désactivation approuvée par"] = el.LastDesactivationApprouve_By ?? "";
    data["Dernière date d'approbation de la désactivation"] = formatTime(
      el.LastApprouveDesactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière activation initée par"] = el.LastResactivationInit_By ?? "";
    data["Dernière date d'initiation de l'activation"] = formatTime(
      el.LastInitResactivationDate,
      "dd/MM/yyyy HH:mm:ss",
    );
    data["Dernière activation approuvée par"] = el.LastResactivationApprouve_By ?? "";
    data["Dernière date d'activation"] = formatTime(el.LastApprouveResactivationDate, "dd/MM/yyyy HH:mm:ss");

    return data;
  });

  return result;
};

/**
 * Cette fonction format les clés d'un tableau d'ojet de sort que les données soient libile lors de l'exportation (Elle est spécialement consu pour l'export des données des utilisateurs)
 * @param {Array} array le tableau à exporter
 * @returns {Array} retourn un tableau avec des clés lisible
 */
export const customUserAdminExportData = (array: any[] = []): any[] => {
  let result: any[] = [];

  result = array.map((el: any) => {
    let data: any = {};

    // User info
    data["Nom"] = el.familyName ?? "";
    data["Prénoms"] = el.firstname ?? "";
    data["Email"] = el.email ?? "";
    data["Numéro"] = el.msisdn ?? "";
    data["Login"] = el.login ?? "";
    data["Profil"] = el.level == "Basic" ? "Utilisateur BO" : "Responsable BO";
    data["Date de création"] = formatTime(el.createdAt, "dd/MM/yyyy HH:mm:ss");
    data["Activé"] = el.statut ? "Oui" : "Non";

    return data;
  });

  return result;
};

/**
 * Cette fonction format les clés d'un tableau d'ojet de sort que les données soient libile lors de l'exportation (Elle est spécialement consu pour l'export des données des utilisateurs)
 * @param {Array} array le tableau à exporter
 * @returns {Array} retourn un tableau avec des clés lisible
 */
export const customTransactionsExportData = (array: any[] = []): any[] => {
  let result: any[] = [];

  result = array.map((el: any) => {
    let data: any = {};

    data["ID de la transaction"] = el.transferid ?? "";
    data["Service"] = getTransactionTypeLabel(el.header_servicetype);
    data["Compte débité"] = el.movments_sender_msisdn ?? "";
    data["Compte crédité"] = el.movments_receiver_msisdn ?? "";
    data["Montant"] = formatAmountFCFA(el.header_requestedvalue);
    data["Statut"] = getTransactionStatusLabel(el.header_transferstatus);
    data["Date de la transaction"] = formatTime(el.header_transferdate, "dd/MM/yyyy HH:mm:ss");

    return data;
  });

  return result;
};

export const removeAccents = (str: string): string => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function displayAlertMessage({ type, message, place }: { message: string; place: string; type: string }) {
  const settingStore = useSettingStore();
  settingStore.setAlertParam({ visible: true, type, message, place });
}

/**
 * Cette fonction format les elements d'un tableau d'objet et place toutes les clés au même niveau.
 * @param {Array} array Le tableau à ranger
 * @param {string} type Le type d'objet contenu dans le tableau
 * @returns {Array} un tableau d'objet bien rangé
 */
export const globalCustomDataList = (array: any[] = [], type: string = "company"): any[] => {
  let result: any[] = [];
  result = array.map((el: any) => {
    return {
      ...el[type],
      createdAt: el.createdAt,
      updatedAt: el.updatedAt,
      action: el.action,
      reason: el.reason,
      updateData: el.updateData ?? null,
      _idDemande: el._id, // On récupère l'id de la demande
    };
  });

  return result;
};

export function getTransactionTypeLabel(type: string): string {
  let label = "";
  switch (type) {
    case "B2BMERPAY":
      label = "Paiement marchand";
      break;
    case "P2P":
      label = "Transfert";
      break;
    case "O2C":
      label = "Approvisionnement";
      break;
    default:
      label = type;
      break;
  }

  return label;
}

export function getTransactionStatusLabel(status: string): string {
  let label = "";
  switch (status) {
    case "TS":
      label = "Succès";
      break;
    case "TI":
      label = "Initié";
      break;
    case "TF":
      label = "Échec";
      break;
    default:
      label = status;
      break;
  }

  return label;
}

export function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function calculerAge(date: string) {
  const dateArray = date.split("/"); // Split la date en jour, mois et année
  const day = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1; // Mois commence à 0 pour Janvier
  const year = parseInt(dateArray[2], 10);

  const today = new Date();
  const birthday = new Date(year, month, day);

  let age = today.getFullYear() - birthday.getFullYear();
  if (
    today.getMonth() < birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  return age;
}

export const i18nRoute = (to: any) => {
  return {
    name: `${to.locale ?? i18n.global.locale.value}.${to.name}`,
    params: {
      ...to.params,
    },
    query: {
      ...to.query,
    },
    hash: to.hash,
  };
};
