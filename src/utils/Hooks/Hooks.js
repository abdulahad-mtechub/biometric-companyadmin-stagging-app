// hooks/useProfile.js
import {useState, useCallback} from 'react';
import {fetchApis} from '@utils/Helpers';
import {baseUrl} from '@constants/urls';
import {useDispatch, useSelector} from 'react-redux';
import {useAlert} from '@providers/AlertContext';
import {
  setUser,
  setPlanDetailsData,
  setPlanDetailsLoading,
  setPlanDetailsError,
} from '@redux/Slices/authSlice';
import {
  setDepartments,
} from '@redux/Slices/globalStatesSlice';

export const useProfile = () => {
  const [ProfileDetails, setProfileDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {token} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const dispatch = useDispatch();

  const getProfile = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/profile`,
        'GET',
        setIsLoading,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (ok && !data?.error) {
        setProfileDetails(data?.data);
        dispatch(setUser(data?.data));
      } else {
        showAlert(data?.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      logger.log(error, {context: 'Hooks'});
      showAlert('Something went wrong', 'error');
    }
  }, [token, showAlert, dispatch]);

  return {
    ProfileDetails,
    isLoading,
    getProfile,
  };
};

export const usePlanDetails = () => {
  const {planDetails, planDetailsLoading, planDetailsError, token} =
    useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const dispatch = useDispatch();

  const refetch = useCallback(async () => {
    try {
      dispatch(setPlanDetailsLoading(true));
      const {ok, data} = await fetchApis(
        `${baseUrl}/payments/company-admin/plan-details`,
        'GET',
        null,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (ok && !data?.error) {
        dispatch(setPlanDetailsData(data?.data));
      } else {
        const errorMsg = data?.message || 'Failed to fetch plan details';
        dispatch(setPlanDetailsError(errorMsg));
        showAlert(errorMsg, 'error');
        console.log({errorMsg});
      }
    } catch (error) {
      logger.log(error, {context: 'Hooks'});
      const errorMsg = 'Something went wrong';
      dispatch(setPlanDetailsError(errorMsg));
      showAlert(errorMsg, 'error');
    }
  }, [token, showAlert, dispatch]);

  return {
    planDetails,
    loading: planDetailsLoading,
    error: planDetailsError,
    refetch,
  };
};
export const useGetAttendanceRecords = () => {
  const [attendanceRecords, setAttendanceRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {token} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const dispatch = useDispatch();

  const getAttendanceRecords = useCallback(
    async workerId => {
      try {
        const {ok, data} = await fetchApis(
          `${baseUrl}/attendance/admin/records?page=1&limit=10&from=2025-08-24&to=2025-08-24&workerId=${workerId}`,
          'GET',
          setIsLoading,
          null,
          showAlert,
          {Authorization: `Bearer ${token}`},
        );

        if (ok && !data?.error) {
          setAttendanceRecords(data?.data?.records);
        } else {
          showAlert(data?.message || 'Something went wrong', 'error');
        }
      } catch (error) {
        logger.log(error, {context: 'Hooks'});
        showAlert('Something went wrong', 'error');
      }
    },
    [token, showAlert, dispatch],
  );

  return {
    attendanceRecords,
    isLoading,
    getAttendanceRecords,
  };
};

export const useUnvalidatedPunches = () => {
  const [unValidatedPunchesCount, setUnValidatedPunchesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {token} = useSelector(store => store.auth);
  const {showAlert} = useAlert();

  const getUnvalidatedPunches = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/attendance/unvalidated?no_pagination=true&status=PENDING`,
        'GET',
        setIsLoading,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (ok && !data?.error) {
        setUnValidatedPunchesCount(data?.data?.punches.length || 0);
      } else {
        showAlert(
          data?.message ||
            'Something went wrong while getting unvalidated punches',
          'error',
        );
      }
    } catch (error) {
      logger.log(error, {context: 'Hooks'});
      showAlert('Something went wrong', 'error');
    }
  }, [token, showAlert]);

  return {
    unValidatedPunchesCount,
    isLoading,
    getUnvalidatedPunches,
  };
};

export const useDepartments = () => {
  const [departments, setDepartment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {token} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const dispatch = useDispatch();

  const getDepartments = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/departments`,
        'GET',
        setIsLoading,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (ok && !data?.error) {
        const transformedDepartments =
          data?.data?.departments?.map(item => ({
            label: item.name,
            value: item.id,
          })) || [];

        setDepartment(transformedDepartments);
        dispatch(setDepartments(transformedDepartments));
      } else {
        showAlert(data?.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      console.log(error, {context: 'Hooks.useDepartments'});
      showAlert('Something went wrong', 'error');
    }
  }, [token, showAlert, dispatch]);

  return {
    departments,
    isLoading,
    getDepartments,
  };
};

export const useApiData = () => {
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const resetPagination = useCallback(() => {
    setPage(1);
    setHasNext(false);
  }, []);

  return {
    apiData,
    setApiData,
    page,
    setPage,
    hasNext,
    setHasNext,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    refreshing,
    setRefreshing,
    resetPagination,
  };
};
