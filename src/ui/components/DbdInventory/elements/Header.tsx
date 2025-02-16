import React from "react";
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

function Header({ character, playerName, locale, user }: HeaderProps) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const userColor = user.hexAccentColor ? user.hexAccentColor : "#0095FF";

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
                    <img src={icons.DBDINFO_LOGO} className="inventory-logo"
                         alt="DBDInfo Logo"/>
                    <div className="inventory-credits">
                        {t('dbd_inventory.header.created_by', locale, ELocaleNamespace.UI, {
                            masusder: "Masusder"
                        })}
                    </div>
                </div>
                <div className="inventory-generation-container">
                    <div className="inventory-generation-date">
                        {formattedDate}
                    </div>
                    <div className="inventory-generation-text-container">
                        <div className="inventory-generation-title">
                            {t('dbd_inventory.header.generated_by', locale, ELocaleNamespace.UI)}
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: "5px"
                        }}>
                            <img
                                src={user.displayAvatarURL()}
                                className="inventory-generation-avatar"
                                alt="Avatar"/>
                            <div className="inventory-generation-username"
                                 style={{
                                     background: `linear-gradient(155deg, #E3E3E3 0%, ${userColor} 200%)`,
                                     WebkitBackgroundClip: 'text',
                                     WebkitTextFillColor: 'transparent',
                                 }}>
                                {user.username}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;