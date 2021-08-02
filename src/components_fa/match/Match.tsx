import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { isMobile } from "react-device-detect";
import classNames from 'classnames';

// Components
import { Icon } from '@material-ui/core';
import { Team } from 'components_fa/index';
import Bets from './components/Bets';
import Time from './components/Time';

// Selectors
import { selectIsLoading } from 'store/matches/selector';

// Types & Constants
import { TMatch } from 'store/matches/types';
import { calculateCorrectBets } from 'constants/bets';
import styles from './Match.module.scss';

type TProps = TMatch & {
    isExpanded: boolean;
    onExpandClick: (id: number) => void;
};

const Match = ({
    away,
    bets,
    loggedUserBets = null,
    home,
    id,
    isExpanded = false,
    status,
    timestamp,
    onExpandClick,
}: TProps) => {
    const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
    const isLoading = useSelector(selectIsLoading);

    const correctBets = calculateCorrectBets(away.score || 0, home.score || 0);

    let isBullseyeBet, isHalfBet = false;
    if (loggedUserBets) {
        isBullseyeBet = correctBets.bullseye.find((correctBet) => correctBet === loggedUserBets.value) !== undefined;
        isHalfBet = correctBets.half.find((correctBet) => correctBet === loggedUserBets.value) !== undefined;
    }

    setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 30000); //30s

    const borderClass = classNames({
        [styles.greenBorder]: loggedUserBets && isBullseyeBet && currentTimestamp >= timestamp, // bullseye
        [styles.blueBorder]: loggedUserBets && isHalfBet && currentTimestamp >= timestamp, // bullseye
        [styles.redBorder]: loggedUserBets && !isBullseyeBet && !isHalfBet && currentTimestamp >= timestamp, // bullseye
    });

    const onClick = () => {
        onExpandClick(id);
    }

    const renderTeams = () => {
        const teamsContainerClass = classNames(styles.teamsContainer, {
            [styles.teamsContainerLoading]: isLoading
        });

        return (
            <div className={teamsContainerClass}>
                <Team {...away} isExpanded={isExpanded} />
                <Team {...home} isExpanded={isExpanded} />
            </div>
        )
    };

    const matchContainerClass = classNames(borderClass, {
        [styles.matchContainer]: !isExpanded && !isMobile,
        [styles.matchContainerMobile]: isMobile,
        [styles.matchContainerExpanded]: isExpanded,
    });

    const betsContainerClass = classNames(styles.betsContainer, {
        [styles.betsContainerHidden]: !isExpanded || !bets || (bets.length === 0 && !loggedUserBets),
    });

    return (
        <div className={styles.container}>
            <div
                className={matchContainerClass}
                key={id}
                onClick={onClick}
            >
                {!isMobile && <div className={styles.collapsibleIcon}>
                    {!isExpanded && <Icon fontSize="small" classes={{ root: 'fas fa-angle-down color-grey2' }} />}
                    {isExpanded && <Icon fontSize="small" classes={{ root: 'fas fa-angle-up color-grey2' }} />}
                </div>}
                <Time
                    currentTimestamp={currentTimestamp}
                    isExpanded={isExpanded}
                    status={status}
                    timestamp={timestamp}
                />
                {renderTeams()}
            </div>
            <div className={betsContainerClass}>
                <Bets
                    bets={bets}
                    correctBets={correctBets}
                    loggedUserBets={loggedUserBets}
                />
            </div>
        </div>
    );
};

export default Match;
