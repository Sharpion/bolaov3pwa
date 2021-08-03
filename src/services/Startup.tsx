import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { loadCSS } from "fg-loadcss";
import { usePrevious } from 'services/hooks';

// Components
import { LinearProgress } from 'components/index';

// Actions
import { fetchMatches } from 'store/matches/actions';
import { fetchUserBets } from 'store/bets/actions';
import {
    fetchDefaultConfig,
    fetchRanking,
    fetchSeasonRanking
} from 'store/app/actions';

// Selectors
import { selectIsLoading, selectUser } from 'store/user/selector';
import {
    selectCurrentWeek,
    selectCurrentSeason
} from 'store/app/selector';

import { ROUTES } from 'constants/routes';
import { TMenuOption } from 'components/commonTypes';

const Startup = (props: any) => {
    const [progress, setProgress] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<string>(ROUTES.HOME.display);

    const dispatch = useDispatch();
    const isLoadingUser = useSelector(selectIsLoading);
    const loggedUser = useSelector(selectUser);
    const currentWeek = useSelector(selectCurrentWeek);
    const currentSeason = useSelector(selectCurrentSeason);
    const progressBarTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isOnResultsOrBets = currentPage === ROUTES.RESULTS.display
        || currentPage === ROUTES.BETS.display;

    const { pathname } = useLocation();
    const history = useHistory();
    const prevWeek = usePrevious(currentWeek);
    const prevPage = usePrevious(currentPage);

    const menuOptions: TMenuOption[] = [
        {
            display: ROUTES.HOME.display,
            route: ROUTES.HOME.url
        },
        {
            display: ROUTES.RESULTS.display,
            route: ROUTES.RESULTS.url
        },
        {
            display: ROUTES.BETS.display,
            route: ROUTES.BETS.url,
            disabled: loggedUser ? false : true
        },
        {
            display: ROUTES.EXTRAS.display,
            route: ROUTES.EXTRAS.url,
            disabled: loggedUser ? false : true
        },
        {
            display: ROUTES.RECORDS.display,
            route: ROUTES.RECORDS.url
        },
        {
            display: ROUTES.RULES.display,
            route: ROUTES.RULES.url
        },
    ];

    useEffect(() => {
        dispatch(fetchDefaultConfig());
        loadCSS("https://use.fontawesome.com/releases/v5.15.0/css/all.css");
    }, [dispatch]);

    useEffect(() => {
        if (!isLoadingUser && !loggedUser) {
            const currentPath = menuOptions.find((option) => pathname.includes(option.route));

            if (currentPath !== undefined && currentPath.disabled) {
                history.push(ROUTES.HOME.url);
            }
        }
    }, [history, isLoadingUser, loggedUser, pathname]);

    const fetchSectionMatches = () => {
        if (currentPage === ROUTES.RESULTS.display) {
            dispatch(fetchMatches(currentSeason as number, currentWeek as number));
        } else if (currentPage === ROUTES.BETS.display) {
            dispatch(fetchUserBets(currentSeason as number, currentWeek as number));
        }
    };

    const fetchBothRankings = () => {
        if (isOnResultsOrBets || pathname.includes(ROUTES.RANKING.url)) {
            dispatch(fetchSeasonRanking(currentSeason as number));
            dispatch(fetchRanking(currentSeason as number, currentWeek as number));
        }
    };

    useEffect(() => {
        if (pathname.includes(ROUTES.RESULTS.url)) {
            setCurrentPage(ROUTES.RESULTS.display);
        } else if (pathname.includes(ROUTES.BETS.url)) {
            setCurrentPage(ROUTES.BETS.display);
        } else if (pathname.includes(ROUTES.RANKING.url)) {
            setCurrentPage(ROUTES.RANKING.display);
        } else {
            setCurrentPage(ROUTES.HOME.display);
        }
    }, [pathname]);

    useEffect(() => {
        if (currentSeason === null) {
            return;
        }

        if (currentWeek === null) {
            return;
        }

        if (isOnResultsOrBets && progressBarTimer.current === null) {
            // Entering Results or Bets
            fetchBothRankings();
            fetchMatchesAndResetTimer();
        } else if (!isOnResultsOrBets && progressBarTimer.current !== null) {
            // Leaving Results or Bets
            setProgress(0);
            clearInterval(progressBarTimer.current);
            progressBarTimer.current = null;
        } else if (prevPage !== currentPage && isOnResultsOrBets) {
            // Switching between Results and Pages
            fetchBothRankings();
            fetchMatchesAndResetTimer();
        } else if (prevWeek !== currentWeek) {
            // If changed week
            fetchBothRankings();

            if (isOnResultsOrBets) {
                fetchMatchesAndResetTimer();
            }
        }
    }, [currentSeason, currentWeek, currentPage]);

    const fetchMatchesAndResetTimer = () => {
        if (progressBarTimer.current !== null) {
            setProgress(0);
            clearInterval(progressBarTimer.current);
        }

        fetchSectionMatches();
        progressBarTimer.current = setInterval(timerFunction, 333); // From 0 to 100 -> every 30 seconds
    };

    const timerFunction = () => {
        setProgress((oldProgress) => {
            if (oldProgress >= 100) {
                fetchSectionMatches();
                fetchBothRankings();
                return 0;
            }
            return oldProgress + 1.1111;
        });
    };

    return (
        <>
            {isOnResultsOrBets && <LinearProgress progress={progress} />}
            {props.children}
        </>
    )
};

export default Startup;