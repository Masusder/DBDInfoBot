import React from "react";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { Role } from "@data/Role";
import {
    Locale,
    User
} from "discord.js";
import { Character } from "@tps/character";
import { DbdPlayerName } from "@commands/inventory/schemas/playerNameSchema";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import * as icons from '@resources/base64Icons.json'

type HeaderProps = {
    character: Character;
    playerName: DbdPlayerName;
    locale: Locale;
    user: User;
}

// TODO: use discord locale
function Header({ character, playerName, locale, user }: HeaderProps) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="inventory-header">
            <div className="inventory-header-flex">
                <div className="inventory-title-container">
                    <div className="inventory-header-player-name">
                        {playerName.playerName}
                    </div>
                    <div className="inventory-header-title">
                        {t('dbd_inventory.header.player_inventory', locale, ELocaleNamespace.UI)}
                    </div>
                    <div className="inventory-header-character-name"
                         style={{ filter: `drop-shadow(0px 0px 2px ${Role[character.Role as "Killer" | "Survivor"].hexColor})` }}>
                        {character.Name}
                    </div>
                </div>
                <div className="inventory-logo-container">
                    {/* TODO: localize, use base64 icon */}
                    <img src={icons.DBDINFO_LOGO} className="inventory-logo"
                         alt="DBDInfo Logo"/>
                    <div className="inventory-credits">
                        {t('dbd_inventory.header.created_by', locale, ELocaleNamespace.UI)} Masusder
                    </div>
                </div>
                <div className="inventory-generation-container">
                    {/*  TODO: Use user data  */}
                    <div className="inventory-generation-text-container">
                        <div className="inventory-generation-title">
                            {/* TODO: localize */}
                            {t('dbd_inventory.header.generated_by', locale, ELocaleNamespace.UI)}
                        </div>
                        <img
                            src={user.avatarURL() || ""}
                            className="inventory-generation-avatar"
                            alt="Avatar"/>
                        <div className="inventory-generation-username">
                            {user.username}
                        </div>
                    </div>
                    <div className="inventory-generation-date">
                        {formattedDate}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;