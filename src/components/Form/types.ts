export interface City {
    id: number;
    name: string;
  }
  
  export interface Speciality {
    id: number;
    name: string;
    params: {
      gender: string | number;
    };
  }
  
  export interface Doctor {
    id: number;
    name: string;
    cityId: string | number;
    specialityId: string | number;
    isPediatrician: boolean;
    surname: string;
    [key: string]: string | number | boolean | undefined;
  }
  
  export interface FormValues {
    name: string;
    birthday: Date | undefined;
    sex: string;
    city: string;
    speciality: string;
    doctor: string;
    contact: string;
  }
  
  export interface FilterProps {
    isPediatrician?: boolean;
    cityId?: string | number;
    specialityId?: string | number;
    [key: string]: string | number | boolean | undefined;
  }