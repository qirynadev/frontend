import i18n from "@/i18n";
import { useHttp } from "./UseHttp";

export class HttpService {
  private http: any;
  private get defaultData() {
    return {
      message: i18n.global.t("validation.network-error"),
      data: [] as any[],
    };
  }
  constructor(private useToken: boolean = true) {
    this.http = useHttp(this.useToken);
  }

  private extractErrorMessage(data: any, fallback: string): string {
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && data.errors[firstKey]?.[0]) {
        return data.errors[firstKey][0];
      }
    }
    return data?.message ?? data?.error ?? fallback;
  }

  async get(uri: string) {
    try {
      const { data, status } = await this.http.get(uri);
      return {
        data: data,
        success: true,
        status: status === 200 || status === 201,
        message: data?.message ?? data?.success ?? this.defaultData.message,
      };
    } catch ({ response, message }: any) {
      const data = response?.data;
      const status = response?.status ?? 0;
      return {
        success: false,
        status,
        data: data ?? this.defaultData.data,
        message: this.extractErrorMessage(data, message),
      };
    }
  }
  async post(uri: string, formData?: any, config?: any) {
    try {
      const { data, status } = await this.http.post(uri, formData, config);
      return {
        data: data,
        status: status,
        success: status === 200 || status === 201,
        message: data?.message ?? data?.success ?? this.defaultData.message,
      };
    } catch ({ response, message }: any) {
      const data = response?.data;
      const status = response?.status ?? 0;
      return {
        success: false,
        status,
        data: data ?? this.defaultData.data,
        message: this.extractErrorMessage(data, message),
      };
    }
  }
  async patch(uri: string, formData?: any) {
    try {
      const { data, status } = await this.http.patch(uri, formData);
      return {
        data: data,
        status: status,
        success: status === 200 || status === 201,
        message: data?.message ?? data?.success ?? this.defaultData.message,
      };
    } catch ({ response, message }: any) {
      const data = response?.data;
      const status = response?.status ?? 0;
      return {
        success: false,
        status,
        data: data ?? this.defaultData.data,
        message: this.extractErrorMessage(data, message),
      };
    }
  }
  async deleted(uri: string, formData: any) {
    try {
      const { data, status } = await this.http.delete(uri, formData);
      return {
        data: data,
        status: status,
        success: status === 200 || status === 201,
        message: data?.message ?? data?.success ?? this.defaultData.message,
      };
    } catch ({ response, message }: any) {
      const data = response?.data;
      const status = response?.status ?? 0;
      return {
        success: false,
        status,
        data: data ?? this.defaultData.data,
        message: this.extractErrorMessage(data, message),
      };
    }
  }
  async put(uri: string, formData: any) {
    try {
      const { data, status } = await this.http.put(uri, formData);
      return {
        data: data,
        status: status,
        success: status === 200 || status === 201,
        message: data?.message ?? data?.success ?? this.defaultData.message,
      };
    } catch ({ response, message }: any) {
      const data = response?.data;
      const status = response?.status ?? 0;
      return {
        success: false,
        status,
        data: data ?? this.defaultData.data,
        message: this.extractErrorMessage(data, message),
      };
    }
  }
}
